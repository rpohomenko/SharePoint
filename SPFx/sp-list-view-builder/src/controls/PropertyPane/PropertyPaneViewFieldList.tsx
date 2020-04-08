import * as React from 'react';

import styles from './PropertyPane.module.scss';
import * as strings from 'ListViewBuilderWebPartStrings';

import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { IconButton, getTheme, mergeStyleSets } from 'office-ui-fabric-react';
import { PropertyPaneList, IPropertyPaneListProps } from './PropertyPaneList';
import { IViewField, DataType } from '../../webparts/listViewBuilder/IConfiguration';
import { AddViewFieldsPanel } from '../components/addViewFieldsPanel';

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
         { key: 'title', name: 'Title', fieldName: 'Title', minWidth: 50, maxWidth: 150, isResizable: true },
         //{ key: 'name', name: 'Name', fieldName: 'Name', minWidth: 50, maxWidth: 100, isResizable: true },
         {
            key: 'dataType', name: 'Data Type', fieldName: 'dataType', minWidth: 50, maxWidth: 100, isResizable: false,
            onRender: (item: IViewField) => {
               return this.display_DataType(item.DataType);
            }
         }
      ];

      super(targetProperty, properties);

      this._listId = properties.listId;

      this._addViewFieldsPanel = React.createRef();
   }

   private display_DataType(type: DataType) {     
      return strings.FieldTypeNames[type];
   }

   protected onRenderElement(): React.ReactElement {
      const element = super.onRenderElement(
         {
            key: 'add', text: 'Add', iconProps: { iconName: 'Add' },
            disabled: !this._listId,
            onClick: () => {
               if (this._addViewFieldsPanel.current) {
                  this._addViewFieldsPanel.current.open();
               }
            }
         });
      return <div className={styles.viewFieldList}>        
         {element}
         <AddViewFieldsPanel ref={this._addViewFieldsPanel} listId={this._listId} fields={this.properties.items} onAddFields={(fields) =>{ 
           const items = [... this.properties.items, ...fields];
           this.set_items(items);
         }} />
      </div>;
   }
}