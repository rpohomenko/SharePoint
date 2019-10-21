import React from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';

export class TaskList extends React.Component {
    constructor(props/*: {}*/) {
        super(props);
    
        this._items = [];
    
        const columns/*: IColumn[]*/ = [         
          {
            key: 'Title',
            name: 'Title',
            fieldName: 'Title',
            minWidth: 210,
            maxWidth: 350,
            isRowHeader: true,
            isResizable: true,
            isSorted: true,
            isSortedDescending: false,
            sortAscendingAriaLabel: 'Sorted A to Z',
            sortDescendingAriaLabel: 'Sorted Z to A',
            onColumnClick: this._onColumnClick,
            data: 'string',
            isPadded: true
          }
        ];

        this._selection = new Selection({
          onSelectionChanged: () => {
            this.setState({
              
            });
          }
        });
    
        this.state = {
          items: this._items,
          columns: columns
        };
      }

      /*private*/ _getKey(item/*: any*/, index/*?: number*/)/*: string*/ {
        return item.key;
      }

      /*private*/ _onItemInvoked(item/*: any*/)/*: void*/ {
        alert(`Item invoked: ${item.name}`);
      }

      /*private*/ _onColumnClick = (ev/*: React.MouseEvent<HTMLElement>*/, column/*: IColumn*/)/*: void*/ => {
        const { columns, items } = this.state;
        const newColumns/*: IColumn[]*/ = columns.slice();
        const currColumn/*: IColumn*/ = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol/*: IColumn*/) => {
          if (newCol === currColumn) {
            currColumn.isSortedDescending = !currColumn.isSortedDescending;
            currColumn.isSorted = true;           
          } else {
            newCol.isSorted = false;
            newCol.isSortedDescending = true;
          }
        });
      
        // this.setState({
        //   columns: newColumns,
        //   items: newItems
        // });
      };

      /*public*/ render() {
        const { columns, items } = this.state;
    
        return (
          <Fabric>
              <DetailsList
                items={items}
                compact={false}
                columns={columns}
                selectionMode={SelectionMode.none}
                getKey={this._getKey}
                setKey="none"
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={true}
                onItemInvoked={this._onItemInvoked}
              />          
          </Fabric>
        );
      }
    }

const Tasks = () => {
  return (<TaskList></TaskList>);
};

export default Tasks;