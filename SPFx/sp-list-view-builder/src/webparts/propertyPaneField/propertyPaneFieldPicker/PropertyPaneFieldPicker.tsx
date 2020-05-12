import * as React from 'react';
import * as ReactDom from 'react-dom';
import { IPropertyPaneField, PropertyPaneFieldType } from "@microsoft/sp-property-pane";
import { Separator, Stack } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { IPropertyPaneFieldPickerInternalProps, IPropertyPaneFieldPickerProps } from './IPropertyPaneFieldPickerProps';
import { FieldPicker } from '../../../controls/components/fieldPicker';
import { IField } from '../../../utilities/Entities';
import { IFieldInfo } from '@pnp/sp/fields';

export class PropertyPaneFieldPicker implements IPropertyPaneField<IPropertyPaneFieldPickerProps> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneFieldPickerInternalProps;
  private elem: HTMLElement;
  protected selection: any[];

  constructor(targetProperty: string, properties: IPropertyPaneFieldPickerProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      key: properties.label,
      targetProperty: targetProperty,
      label: properties.label,
      list: properties.list,
      placeholder: properties.placeholder,
      itemLimit: properties.itemLimit,
      selected: properties.selected,
      disabled: properties.disabled,
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
    const element: React.ReactElement = this.onRenderElement();
    ReactDom.render(<div>
      <Stack tokens={{ childrenGap: 2 }}>
        <Stack.Item>
          <Separator />
        </Stack.Item>
        <Stack.Item>
          <span>{this.properties.label}</span>
          {element}
        </Stack.Item>
      </Stack>
    </div>, elem);
  }

  protected onRenderElement(): React.ReactElement {
    return <FieldPicker list={this.properties.list} disabled={this.properties.disabled} itemLimit={this.properties.itemLimit} placeholder={this.properties.placeholder} selected={this.properties.selected}
      onFilter={this.properties.onFilter}
      onChange={(fields: IFieldInfo[]) => {
        if (fields instanceof Array && fields.length > 0) {
          const value = this.properties.itemLimit === 1
            ? { Id: fields[0].Id, Name: fields[0].InternalName, Title: fields[0].Title } as IField
            : fields.map(field => { return { Id: field.Id, Name: field.InternalName, Title: field.Title } as IField; });
          this.properties.onPropertyChange(this.targetProperty, value);
        }
        else {
          this.properties.onPropertyChange(this.targetProperty, null);
        }
      }} />;
  }
}