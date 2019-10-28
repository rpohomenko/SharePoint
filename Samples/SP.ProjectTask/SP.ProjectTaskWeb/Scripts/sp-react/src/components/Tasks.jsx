import React from "react";
import BaseListView from "./BaseListView";
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';

export class TaskList extends BaseListView {

  constructor(props) {
    super(props);
    this._service = props.service;
    this._onNewItem = this._onNewItem.bind(this);
  }

  getColumns = () => {
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
        isPadded: false
      }
    ];
    return columns;
  }

  fetchData = (count, nextPageToken, sortBy, sortDesc, filter, options) => {
    return this._service.getTasks(count, nextPageToken, sortBy, sortDesc, filter, options);
  }

  fetchDataAsync = async (count, nextPageToken, sortBy, sortDesc, filter, options) => {
    return await this.fetchData(count, nextPageToken, sortBy, sortDesc, filter, options);
  }

  _onNewItem = (sender, e) => {
    alert('new item clicked!');
  }

  _getCommandItems = () => {
    return [
      {
        key: 'newItem',
        name: 'New',
        onClick: (e, sender) => this._onNewItem(sender, e),
        iconProps: {
          iconName: 'Add'
        },
        ariaLabel: 'New'
      }]
  }

  render() {

    return (
      <div>
        <CommandBar
          items={this._getCommandItems()}
        />
        {super.render()}
      </div>
    );
  }
}

const Tasks = (props) => {
  return (<TaskList service={props.service} pageSize={10}></TaskList>);
};

export default Tasks;