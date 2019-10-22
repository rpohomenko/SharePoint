import React from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';

export class TaskList extends React.Component {
    constructor(props) {
        super(props);
    
        this._items = [];
     
        const columns = [         
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
          columns: columns,
          count: 30,
          nextPageToken: null,
          isLoading: false
        };
      }

      _getKey(item, index) {
        return item.key;
      }

      _onItemInvoked(item) {
        alert(`Item invoked: ${item.name}`);
      }

      _onColumnClick = (ev, column) => {
        const { columns, items } = this.state;
        const newColumns = columns.slice();
        const currColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol) => {
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

      _loadItems(){
        let { isLoading, count, nextPageToken } = this.state;  
        let url = `https://localhost:44318/api/web/tasks?count=${count}}`;
        this.setState({ isLoading: true });
        
        fetch(url).then(
          response => response.json()).then(json => {
          let items = json;
          this.setState({ 
            items,
            //nextPageToken: json.data._nextPageToken,
            isLoading: false
          });
           this._selection.setItems(items);
        }, (reason) => {
           debugger;
        });
       }
       
      _onRenderMissingItem(){ 

      }

      componentDidMount() {
          this._loadItems();
      }
    
      componentWillUnmount() {
    
      }
    

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
                onRenderMissingItem={ () => this._onRenderMissingItem() }
              />          
          </Fabric>
        );
      }
    }

const Tasks = () => {
  return (<TaskList></TaskList>);
};

export default Tasks;