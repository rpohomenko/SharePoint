import * as React from 'react';
import * as ReactDom from 'react-dom';
import styles from './PropertyPane.module.scss';

import { IPropertyPaneField, PropertyPaneFieldType } from "@microsoft/sp-property-pane";
import { Stack } from 'office-ui-fabric-react/lib/components/Stack';
import { Separator } from 'office-ui-fabric-react/lib/components/Separator';

import {
  IDetailsListProps,
  DetailsList, DetailsListLayoutMode, Selection, IColumn,
  IDragDropEvents,
  IDragDropContext
} from 'office-ui-fabric-react/lib/DetailsList';

import { IPropertyPaneCustomFieldProps } from "@microsoft/sp-property-pane";
import { isArray } from '@pnp/common';

export interface IPropertyPaneListProps {
  label: string;
  onPropertyChange: (propertyPath: string, newValue: any) => void;
  items: any[];
  columns: IColumn[];
  noItemsMessage: React.ReactElement | string;
}

export interface IPropertyPaneListInternalProps extends IPropertyPaneListProps, IPropertyPaneCustomFieldProps {
}

export class PropertyPaneList implements IPropertyPaneField<IPropertyPaneListProps> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneListInternalProps;
  private elem: HTMLElement;

  constructor(targetProperty: string, properties: IPropertyPaneListProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      key: properties.label,
      label: properties.label,      
      items: properties.items,
      columns: properties.columns,
      onPropertyChange: properties.onPropertyChange,
      noItemsMessage: properties.noItemsMessage,
      onRender: this.onRender.bind(this)
    };
  }

  public render(): void {
    if (!this.elem) {
      return;
    }

    this.onRender(this.elem);
  }

  private onRender(elem: HTMLElement): void {
    if (!this.elem) {
      this.elem = elem;
    }
    const element: React.ReactElement<IDetailsListProps> = this.onRenderElement();
    ReactDom.render(<div className={styles.propertyPaneList}>
      <Stack tokens={{ childrenGap: 1 }}>
        <Stack.Item>
          <Separator/>
        </Stack.Item>
        <Stack.Item>
          <span>{this.properties.label}</span>     
          {element}
        </Stack.Item>
      </Stack>
    </div>, elem);
  }

  protected onRenderElement(): React.ReactElement {
    const element: React.ReactElement<IDetailsListProps> = React.createElement(DetailsList, {
      items: this.properties.items,
      columns: this.properties.columns,
      setKey: "set",
      layoutMode: DetailsListLayoutMode.justified,
      selectionPreservedOnEmptyClick: true
    });
    if (!isArray(this.properties.items) || this.properties.items.length === 0) {
      return (<>{element}{this.properties.noItemsMessage}</>);
    }
    return element;
  }

  public set_items(items: any[]): void {
    this.properties.onPropertyChange(this.targetProperty, items);
  }
}