import React from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
require('../Constants.js');

export class TaskList extends React.Component {
  constructor(props) {
    super(props);

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
        /*this.setState({
          
        });*/
      }
    });

    this._onRenderMissingItem = this._onRenderMissingItem.bind(this)

    this.state = {
      items: [],
      columns: columns,
      count: /*30*/3,
      nextPageToken: null,
      isLoading: false
    };
  }

  _getKey(item, index) {
    return item ? item.key : null;
  }

  _onItemInvoked(item) {
    alert(`Item : ${item.Title}`);
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
    this._loadItems(column);
    this.setState({
      columns: newColumns,
      sortBy: column.name,
      sortDesc: column.isSortedDescending
    });
  };

  _loadItems(sortColumn = null) {
    let { isLoading, count, filter, sortBy, sortDesc, nextPageToken, items } = this.state;
    if (isLoading) return;
    if (sortColumn) {
      sortBy = sortColumn.name;
      sortDesc = sortColumn.isSortedDescending;
    }
    let url = `${_apiPath}/web/tasks?count=${count}&pagingToken=${encodeURIComponent(nextPageToken || "")}&where=${encodeURIComponent(filter || "")}&sortBy=${encodeURIComponent(sortBy || "")}&sortDesc=${sortDesc || false}`;
    this.setState({ isLoading: true });

    fetch(url).then(
      response => response.json()).then(json => {
        let newItems = json.items;
        if (items && nextPageToken) {
          newItems = items.slice(0, items.length - 1).concat(newItems);
        }
        if (newItems && json._nextPageToken) {
          newItems.push(null);
        }

        this.setState({
          items: newItems,
          nextPageToken: json._nextPageToken,
          isLoading: false
        });
        this._selection.setItems(newItems);
      }, (reason) => {
        this.setState({
          items: [],
          nextPageToken: null,
          isLoading: false
        });
      });
  }

  _onRenderMissingItem(index) {
    let { nextPageToken } = this.state;
    if (nextPageToken) {
      this._loadItems();
    }
  }

  componentDidMount() {
    this._loadItems();
  }

  componentWillUnmount() {

  }


  render() {
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
          onRenderMissingItem={this._onRenderMissingItem}
        />
      </Fabric>
    );
  }
}

const Tasks = () => {
  return (<TaskList></TaskList>);
};

export default Tasks;