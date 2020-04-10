import * as React from 'react';

import styles from './PropertyPane.module.scss';
import * as strings from 'ListViewBuilderWebPartStrings';

import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { IconButton, getTheme, mergeStyleSets, IColumn } from 'office-ui-fabric-react';
import { PropertyPaneList, IPropertyPaneListProps, PropertyPaneListBuilder } from './PropertyPaneList';
import { IViewField, DataType } from '../../webparts/listViewBuilder/components/spListView/ISPListView';
import { AddViewFieldsPanel } from '../components/addViewFieldsPanel';
import { EditViewFieldPanel } from '../components/editViewFieldPanel';

export interface IPropertyPaneViewFieldListProps extends IPropertyPaneListProps {
   listId: string;
   items: IViewField[];
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

export class PropertyPaneViewFieldList extends PropertyPaneList {

   private _addViewFieldsPanel: React.RefObject<AddViewFieldsPanel>;
   private _editViewFieldsPanel: React.RefObject<EditViewFieldPanel>;
   private _listId: string;

   constructor(targetProperty: string, properties: IPropertyPaneViewFieldListProps) {

      properties.columns = [
         {
            key: "remove", name: "remove", isIconOnly: true, iconName: "Delete", calculatedWidth: 30, maxWidth: 30, minWidth: 10, isResizable: false,
            onRender: (item: IViewField) => {
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
            onRender: (item: IViewField) => {
               return this.display_DataType(item.DataType);
            }
         }
      ];

      super(targetProperty, properties);

      this._listId = properties.listId;

      this._addViewFieldsPanel = React.createRef();
      this._editViewFieldsPanel = React.createRef();
   }

   private display_DataType(type: DataType) {
      return strings.FieldTypeNames[type];
   }

   protected getCommandItems(items: any[], selection?: any[]): ICommandBarItemProps[] {
      return [
         {
            key: 'add', text: 'Add', iconProps: { iconName: 'Add' },
            disabled: !this._listId,
            onClick: () => {
               if (this._addViewFieldsPanel.current) {
                  this._addViewFieldsPanel.current.open();
               }
            }
         },
         {
            key: 'edit', text: 'Edit', iconProps: { iconName: 'Edit' }, iconOnly: true,
            disabled: !(selection instanceof Array) || selection.length !== 1,
            onClick: () => {
               if (selection instanceof Array && selection.length > 0) {
                  if (this._editViewFieldsPanel.current) {
                     this._editViewFieldsPanel.current.setState({ field: selection[0] as IViewField });
                     this._editViewFieldsPanel.current.open();
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
      return <div className={styles.viewFieldList}>
         {element}
         <AddViewFieldsPanel ref={this._addViewFieldsPanel} listId={this._listId} fields={this.properties.items} onAddFields={(fields) => {
            const items = [... this.properties.items, ...fields];
            this.set_items(items);
         }} />
         <EditViewFieldPanel ref={this._editViewFieldsPanel} onChange={(field) => {
            const items: IViewField[] = [... this.properties.items];
            for (const item of items.filter(item => item.Name === field.Name)) {
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