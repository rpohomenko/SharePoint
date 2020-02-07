import * as React from 'react';
import * as ReactDom from 'react-dom';
import styles from './propertyPaneAsyncDropdownProps.module.scss';

import { IPropertyPaneField, PropertyPaneFieldType } from "@microsoft/sp-property-pane";
import { Stack } from 'office-ui-fabric-react/lib/components/Stack';
import { Separator } from 'office-ui-fabric-react/lib/components/Separator';

import { IDropdownOption } from 'office-ui-fabric-react/lib/components/Dropdown';
import { IPropertyPaneAsyncDropdownProps, IPropertyPaneAsyncDropdownInternalProps } from './IPropertyPaneAsyncDropdownProps';
import  { AsyncDropdown, IAsyncDropdownProps } from '../../components/asyncDropdown';

export class PropertyPaneAsyncDropdown implements IPropertyPaneField<IPropertyPaneAsyncDropdownProps> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneAsyncDropdownInternalProps;
  private elem: HTMLElement;

  constructor(targetProperty: string, properties: IPropertyPaneAsyncDropdownProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      key: properties.label,
      label: properties.label,
      placeholder : properties.placeholder,
      loadOptions: properties.loadOptions,
      onPropertyChange: properties.onPropertyChange,
      selectedKey: properties.selectedKey,
      disabled: properties.disabled,
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

    const element: React.ReactElement<IAsyncDropdownProps> = React.createElement(AsyncDropdown, {
      label: this.properties.label,
      placeholder: this.properties.placeholder,
      loadOptions: this.properties.loadOptions,
      onChanged: this.onChanged.bind(this),
      selectedKey: this.properties.selectedKey,
      disabled: this.properties.disabled,
      // required to allow the component to be re-rendered by calling this.render() externally
      stateKey: new Date().toString(),
    });
    ReactDom.render((<div className={styles["property-pane-async-dropdown"]}>
      <Stack tokens={{ childrenGap: 1 }}>
        <Stack.Item>
          <Separator />
        </Stack.Item>
        <Stack.Item>{element}</Stack.Item>
      </Stack>
    </div>), elem);
  }

  private onChanged(option: IDropdownOption, index?: number): void {
    this.properties.onPropertyChange(this.targetProperty, option.key, index);
  }
}