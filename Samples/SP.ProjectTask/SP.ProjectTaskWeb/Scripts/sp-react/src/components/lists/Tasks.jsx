import React from "react";
import BaseListView from "./BaseListView";
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import ListFormPanel from "../form/ListFormPanel";
import TaskForm from "../form/TaskForm";
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';

export class TaskList extends BaseListView {

  constructor(props) {
    super(props);
    this._service = props.service;
    this._onNewItem = this._onNewItem.bind(this);
    this.state = {
      ...this.state
    };
  }

  _getColumns = () => {
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

  _fetchData = (count, nextPageToken, sortBy, sortDesc, filter, options) => {
    return this._service.getTasks(count, nextPageToken, sortBy, sortDesc, filter, options);
  }

  _fetchDataAsync = async (count, nextPageToken, sortBy, sortDesc, filter, options) => {
    return await this._fetchData(count, nextPageToken, sortBy, sortDesc, filter, options);
  }

  _onNewItem = (sender, e) => {
    const listForm = <TaskForm mode={2} />
    this._listform.setState({ listForm: listForm, showPanel: true });
  }

  _getCommandItems = () => {
    return [
      {
        key: 'newItem',
        icon: 'Add',
        name: 'New',
        onClick: (e, sender) => this._onNewItem(sender, e),
        iconProps: {
          iconName: 'Add'
        },
        ariaLabel: 'New'
      }]
  }

  _onRenderItem = (item) => {
    return (
      <CommandBarButton
        role="menuitem"
        aria-label={item.name}
        styles={{ root: { padding: '10px' } }}
        iconProps={{ iconName: item.icon }}
        onClick={item.onClick}
      />
    );
  };

  _onRenderOverflowButton = (overflowItems) => {
    return (
      <CommandBarButton
        role="menuitem"
        title="More items"
        styles={{ root: { padding: 10 }}}
        menuIconProps={{ iconName: 'More' }}
        menuProps={{ items: overflowItems }}
      />
    );
  };

  render() {
    const { listForm } = this.state;
    return (
      <div>
        <OverflowSet styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
          items={this._getCommandItems()}
          onRenderOverflowButton={this._onRenderOverflowButton}
          onRenderItem={this._onRenderItem}
        />
        {super.render()}
        <ListFormPanel ref={ref => this._listform = ref} listForm={listForm} />
      </div>
    );
  }
}

const Tasks = (props) => {
  return (<TaskList service={props.service} pageSize={1}></TaskList>);
};

export default Tasks;