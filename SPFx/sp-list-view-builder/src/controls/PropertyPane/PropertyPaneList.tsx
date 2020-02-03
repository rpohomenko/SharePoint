import * as React from 'react';
import * as ReactDom from 'react-dom';
import { IPropertyPaneField, PropertyPaneFieldType } from "@microsoft/sp-property-pane";

import {
  IDetailsListProps,
  DetailsList, DetailsListLayoutMode, Selection, IColumn,
  IDragDropEvents,
  IDragDropContext
} from 'office-ui-fabric-react/lib/DetailsList';

import { IPropertyPaneCustomFieldProps } from "@microsoft/sp-property-pane";

export interface IPropertyPaneListProps {
  label: string;
  onPropertyChange: (propertyPath: string, newValue: any) => void;
  items: any[];
  columns: IColumn[];
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
    ReactDom.render(<><span>{this.properties.label}</span>{element}</>, elem);
  }

  protected onRenderElement(): React.ReactElement{
    const element: React.ReactElement<IDetailsListProps> = React.createElement(DetailsList, {
      items: this.properties.items,
      columns: this.properties.columns,
      setKey: "set",
      layoutMode: DetailsListLayoutMode.justified,
      selectionPreservedOnEmptyClick: true,
    });
  return element;
  }

  public set_items(items: any[]): void {
    this.properties.onPropertyChange(this.targetProperty, items);
  }
}