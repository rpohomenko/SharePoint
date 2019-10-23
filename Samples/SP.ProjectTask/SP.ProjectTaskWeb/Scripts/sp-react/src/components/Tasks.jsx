import React from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, ColumnActionsMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { IContextualMenuProps, IContextualMenuItem, DirectionalHint, ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
require('../Constants.js');

const SORT_COLUMN_DELAY = 1000;

export class TaskList extends React.Component {

  _controllers = [];
  _timeout;


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
        sortAscendingAriaLabel: 'A to Z',
        sortDescendingAriaLabel: 'Z to A',
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
      count: /*30*/1,
      nextPageToken: null,
      isLoading: false
    };
  }

  _abort() {
    if (this._controllers != null) {
      this._controllers.forEach(c => {
        c.controller.abort();
      });

      this._controllers = [];
    }
    this._aborted = true;
  }

  _getKey = (item, index) => {
    return item ? item.key : null;
  }

  _onItemInvoked = (item) => {
    alert(`Item : ${item.Title}`);
  }

  _onColumnClick = (ev, column) => {
    if (column.columnActionsMode !== ColumnActionsMode.disabled) {
      this.setState({
        contextualMenuProps: this._getContextualMenuProps(ev, column)
      });
    }
  };

  _onSortColumn = (column) => {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    this._timeout = setTimeout(() => {
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

    this._abort();
    let _this = this;
    this._waitAll().then(() => {
      _this._aborted = false;
      _this.setState({
        columns: newColumns,
        items: [],
        nextPageToken: null,
        sortBy: column.name,
        sortDesc: column.isSortedDescending
      });
      _this._loadItems(column, null);
    });   
    }, SORT_COLUMN_DELAY);
  }

  _loadItems = (sortColumn = null, pageToken = null) => {
    let { isLoading, count, filter, sortBy, sortDesc, nextPageToken, items } = this.state;
    if (this._aborted === true) return;

    if (sortColumn) {
      sortBy = sortColumn.name;
      sortDesc = sortColumn.isSortedDescending;
    }
    if (pageToken) {
      nextPageToken = pageToken
    }

    let url = `${_apiPath}/web/tasks?count=${count}&pagingToken=${encodeURIComponent(nextPageToken || "")}&where=${encodeURIComponent(filter || "")}&sortBy=${encodeURIComponent(sortBy || "")}&sortDesc=${sortDesc || false}`;
    this.setState({
      isLoading: true,
      nextPageToken: nextPageToken
    });
    let controller = new AbortController();
    let _this = this;
    this._controllers.push({
      controller: controller, promise: fetch(url, {
        method: 'get',
        signal: controller.signal
      }).then(
        response => response.json()).then(json => {
          let { nextPageToken, items } = _this.state;
          let newItems = json.items;
          if (items && items.length > 0 && nextPageToken) {
            newItems = items.slice(0, items.length - 1).concat(newItems);
          }
          if (newItems && json._nextPageToken) {
            newItems.push(null);
          }
          if (_this._aborted === true) return;
          if (_this._controllers.filter(c => c.controller == controller) === 0) return;

          _this.setState({
            items: newItems,
            nextPageToken: json._nextPageToken,
            isLoading: false
          });
          this._selection.setItems(newItems);
        }, (reason) => {
         
        }).then(() => {
          _this._controllers = _this._controllers.filter(c => c.controller !== controller);
        })
    });
  }

  _onRenderMissingItem = (index) => {
    let { nextPageToken } = this.state;
    if (nextPageToken) {
      let _this = this;
      this._waitAll().then(() => {
        let { isLoading, nextPageToken } = this.state;
        if (isLoading || !nextPageToken) return;
        _this._loadItems(null, nextPageToken);
      });
    }
  }

  _waitAll = () => {
    let promises = [];
    this._controllers.forEach(c => {
      promises.push(c.promise);
    });
    return Promise.all(promises);
  }

  _getContextualMenuProps = (ev, column) => {
    const items = [
      {
        key: 'aToZ',
        name: column.sortAscendingAriaLabel,
        iconProps: { iconName: 'SortUp' },
        canCheck: true,
        checked: column.isSorted && !column.isSortedDescending,
        onClick: () => { column.isSortedDescending = false; this._onSortColumn(column) }
      },
      {
        key: 'zToA',
        name: column.sortDescendingAriaLabel,
        iconProps: { iconName: 'SortDown' },
        canCheck: true,
        checked: column.isSorted && column.isSortedDescending,
        onClick: () => { column.isSortedDescending = true; this._onSortColumn(column) }
      }
    ];
    return {
      items: items,
      target: ev.currentTarget,
      directionalHint: DirectionalHint.bottomLeftEdge,
      gapSpace: 10,
      isBeakVisible: true,
      onDismiss: this._onContextualMenuDismissed
    };
  }

  _onContextualMenuDismissed = () => {
    this.setState({
      contextualMenuProps: undefined
    });
  };

  componentDidMount() {
    this._loadItems();
  }

  componentWillUnmount() {

  }


  render() {
    const { columns, items, contextualMenuProps } = this.state;

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
        {contextualMenuProps && <ContextualMenu {...contextualMenuProps} />}
      </Fabric>
    );
  }
}

const Tasks = () => {
  return (<TaskList></TaskList>);
};

export default Tasks;