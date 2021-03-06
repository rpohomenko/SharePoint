import * as React from 'react';
import * as strings from 'ListViewBuilderWebPartStrings';

import { ICommandBarItemProps, IconButton, getTheme, mergeStyleSets, IColumn } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { PropertyPaneFieldList, IPropertyPaneFieldListProps, IPropertyPaneFieldListInternalProps } from './propertyPaneFieldList';
import { IFormField, DataType } from '../../utilities/Entities';
import AddFormFieldPanel from './components/AddFormFieldPanel';
import { FormFieldEditor } from './components/formFieldEditor';
import { IList } from '@pnp/sp/lists';
import { ITimeZoneInfo, IRegionalSettingsInfo } from '@pnp/sp/regional-settings/types';

export interface IPropertyPaneFormFieldListProps extends IPropertyPaneFieldListProps {
   list: IList;
   items: IFormField[];
   regionalSettings?: Promise<IRegionalSettingsInfo>;
   timeZone?: Promise<ITimeZoneInfo>;
}

const theme = getTheme();

const iconButtonStyles = mergeStyleSets({
   root: {
      color: theme.palette.themePrimary,
      backgroundColor: 'transparent',
      height: '100%'
   },
   rootHovered: {
      color: theme.palette.themePrimary,
      backgroundColor: 'transparent'
   },
   rootPressed: {
      color: theme.palette.neutralLight,
      backgroundColor: 'transparent'
   }
});

export class PropertyPaneFormFieldList extends PropertyPaneFieldList {

   private _addFormFieldPanel: React.RefObject<AddFormFieldPanel>;
   private _formFieldEditor: React.RefObject<FormFieldEditor>;
   private _list: IList;
   private _regionalSettings: Promise<IRegionalSettingsInfo>;
   private _timeZone: Promise<ITimeZoneInfo>;

   constructor(targetProperty: string, properties: IPropertyPaneFormFieldListProps) {

      properties.columns = [
         {
            key: "remove", name: "remove", isIconOnly: true, iconName: "Delete", calculatedWidth: 30, maxWidth: 30, minWidth: 10, isResizable: false,
            onRender: (item: IFormField) => {
               return <IconButton
                  iconProps={{ iconName: 'Delete' }}
                  ariaLabel="Delete"
                  styles={iconButtonStyles}
                  onClick={() => {
                     this.delete_items(item);
                  }} />;
            }
         },
         {
            key: 'title', name: 'Title', fieldName: 'Title', minWidth: 50, maxWidth: 150, isResizable: true, onRender: (item?: any, index?: number, column?: IColumn) => {
               return <span title={item[column.fieldName]}>{item[column.fieldName]}</span>;
            }
         },
         //{ key: 'name', name: 'Name', fieldName: 'Name', minWidth: 50, maxWidth: 100, isResizable: true },
         {
            key: 'dataType', name: 'Data Type', fieldName: 'dataType', minWidth: 70, maxWidth: 100, isResizable: false,
            onRender: (item: IFormField) => {
               return this.display_DataType(item.DataType);
            }
         }
      ];

      super(targetProperty, properties);

      this._regionalSettings = properties.regionalSettings;
      this._timeZone = properties.timeZone;
      this._list = properties.list;
      this._addFormFieldPanel = React.createRef();
      this._formFieldEditor = React.createRef();
   }

   private display_DataType(type: DataType) {
      return strings.FieldTypeNames[type];
   }

   protected getCommandItems(items: any[], selection?: any[]): ICommandBarItemProps[] {
      return [
         {
            key: 'add', text: 'Add', iconProps: { iconName: 'Add' },
            disabled: !this._list,
            onClick: () => {
               if (this._addFormFieldPanel.current) {
                  this._addFormFieldPanel.current.open();
               }
            }
         },
         {
            key: 'edit', text: 'Edit', iconProps: { iconName: 'Edit' }, iconOnly: true,
            disabled: !(selection instanceof Array) || selection.length !== 1,
            onClick: () => {
               if (selection instanceof Array && selection.length > 0) {
                  if (this._formFieldEditor.current) {
                     this._formFieldEditor.current.setState({ field: selection[0] as IFormField });
                     this._formFieldEditor.current.open();
                  }
               }
            }
         },
         {
            key: 'delete', text: 'Delete', iconProps: { iconName: 'Delete' }, iconOnly: true,
            disabled: !(selection instanceof Array) || selection.length === 0,
            onClick: () => {
               if (selection instanceof Array && selection.length > 0) {
                  this.set_items(items.filter(it => selection.indexOf(it) === -1));
               }
            }
         },
         {
            key: 'moveUp', text: 'Move Up', iconProps: { iconName: 'Up' }, iconOnly: true,
            disabled: !(selection instanceof Array) || selection.length === 0 || selection[0] === items[0],
            onClick: () => {
               if (selection instanceof Array && selection.length > 0) {
                  const index = items.indexOf(selection[0]);
                  if (index > 0) {
                     const item = items[index - 1];
                     this._insertBeforeItem(item, selection);
                  }
               }
            }
         },
         {
            key: 'moveDown', text: 'Move Down', iconProps: { iconName: 'Down' }, iconOnly: true,
            disabled: !(selection instanceof Array) || selection.length === 0 || selection[selection.length - 1] === items[items.length - 1],
            onClick: () => {
               if (selection instanceof Array && selection.length > 0) {
                  const index = items.indexOf(selection[selection.length - 1]);
                  if (index < items.length - 1) {
                     const item = items[index + 1];
                     this._insertAfterItem(item, selection);
                  }
               }
            }
         },
      ];
   }

   protected onRenderElement(): React.ReactElement {
      const element = super.onRenderElement();  
      return <div>
         {element}
         <AddFormFieldPanel ref={this._addFormFieldPanel} list={this._list} fields={this.properties.items} onAddFields={(fields) => {
            const items = this.properties.items instanceof Array ? [... this.properties.items, ...fields] : fields;
            this.set_items(items);
         }} />
         <FormFieldEditor ref={this._formFieldEditor} list={this._list} timeZone={this._timeZone} regionalSettings={this._regionalSettings} onChange={(field) => {
            const items: IFormField[] =  this.properties.items instanceof Array ? [... this.properties.items] : [];
            for (const item of items.filter(i => i.Name === field.Name)) {
               items[items.indexOf(item)] = field;
            }
            this.set_items(items);
         }} />
      </div>;
   }

   private _insertBeforeItem(item: any, selection: any[]): void {
      const items = this.properties.items.filter(itm => selection.indexOf(itm) === -1);
      const insertIndex = items.indexOf(item);
      items.splice(insertIndex, 0, ...selection);
      this.set_items(items);
   }

   private _insertAfterItem(item: any, selection: any[]): void {
      const items = this.properties.items.filter(itm => selection.indexOf(itm) === -1);
      const insertIndex = items.indexOf(item);
      items.splice(insertIndex + 1, 0, ...selection);
      this.set_items(items);
   }
}