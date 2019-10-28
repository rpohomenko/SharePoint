import React from "react";
import BaseListView from "./BaseListView";
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import ListFormPanel from "../form/ListFormPanel";
import TaskForm from "../form/TaskForm";

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
    this._listform.setState({listForm: listForm, showPanel: true});
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
    const { listForm } = this.state;    
    return (
      <div>
        <CommandBar
          items={this._getCommandItems()}
        />
        {super.render()}
        <ListFormPanel ref={ref=>this._listform = ref} listForm={listForm} />
      </div>
    );
  }
}

const Tasks = (props) => {
  return (<TaskList service={props.service} pageSize={10}></TaskList>);
};

export default Tasks;