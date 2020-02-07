import * as React from 'react';

import styles from './PropertyPane.module.scss';

import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';

import { PropertyPaneList, IPropertyPaneListProps } from './PropertyPaneList';
import { IViewField, DataType } from '../../webparts/listViewBuilder/IConfiguration';
import { AddViewFieldsPanel } from '../components/addViewFieldsPanel';

export interface IPropertyPaneViewFieldListProps extends IPropertyPaneListProps {
   listId: string;
   items: IViewField[]
}

export class PropertyPaneViewFieldList extends PropertyPaneList {

   private _addViewFieldsPanel: React.RefObject<AddViewFieldsPanel>;
   private _listId: string;

   constructor(targetProperty: string, properties: IPropertyPaneViewFieldListProps) {

      properties.columns = [
         { key: 'title', name: 'Title', fieldName: 'Title', minWidth: 100, maxWidth: 200, isResizable: true },
         //{ key: 'name', name: 'Name', fieldName: 'Name', minWidth: 100, maxWidth: 200, isResizable: true },
         {
            key: 'dataType', name: 'Data Type', fieldName: 'dataType', minWidth: 100, maxWidth: 200, isResizable: true,
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
      // TODO:
      return type.toString();
   }

   protected onRenderElement(): React.ReactElement {
      const element = super.onRenderElement();
      return <div className={styles.viewFieldList}>
         <CommandBar
            items={[
               {
                  key: 'add', text: 'Add', iconProps: { iconName: 'Add' },
                  disabled: !this._listId,
                  onClick: () => {
                     if (this._addViewFieldsPanel.current) {
                        this._addViewFieldsPanel.current.open();
                     }
                  }
               }
            ]}
         />
         {element}
         <AddViewFieldsPanel ref={this._addViewFieldsPanel} listId={this._listId} fields={this.properties.items} onFieldsAdded={(fields) =>{ 
           const items = [... this.properties.items, ...fields];
           this.set_items(items);
         }} />
      </div>;
   }
}