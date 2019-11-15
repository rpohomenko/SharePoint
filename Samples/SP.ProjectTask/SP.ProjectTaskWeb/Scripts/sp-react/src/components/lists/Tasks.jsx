import React from "react";
import BaseListView from "./BaseListView";
//import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import TaskCommand from "../commands/TaskCommand";

export class TaskList extends BaseListView {

  constructor(props) {
    super(props);
    this._service = props.service;
    this.state = {
      ...this.state
    };
  }

  async componentDidMount() {
    await super.componentDidMount();
    if (this._command) {
      const { isLoading, isLoaded } = this.state;
      let newItemEnabled = isLoaded;
      if (newItemEnabled !== this._command.state.newItemEnabled) {
        this._command.setState({ newItemEnabled: newItemEnabled });
      }
      let refreshEnabed = !isLoading;
      if (refreshEnabed !== this._command.state.refreshEnabed) {
        this._command.setState({ refreshEnabed: refreshEnabed });
      }
    }
  }

  render() {
    const { selection } = this.state;
    return (
      <div className="tasks-container">
        <TaskCommand ref={ref => this._command = ref} service={this._service} selection={selection} onRefresh={() => this.refresh(true)} />
        {super.render()}
      </div>
    );
  }

  _getColumns = () => {
    const columns = [
      {
        key: 'Title',
        name: 'Title',
        fieldName: 'Title',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: false,
        isResizable: false,
        isSorted: false,
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

  _onSelectionChanged = (selectionItems) => {
    this._command.setState({ selection: selectionItems });
  }

  _onItemInvoked = (item) => {
    this._command.viewItem(item);
  }

  _onEditItem(item) {
    this._command.editItem(item);
  }

  _onDeleteItem(item) {
    this._command.deleteItem([item]);
  }

  refresh = async (resetSorting, resetFiltering) => {
    if (this._command) {
      this._command.setState({ refreshEnabed: false });
    }
    await this.refresh(resetSorting, resetFiltering);
    if (this._command) {
      this._command.setState({ refreshEnabed: true });
    }
  }
}

const Tasks = (props) => {
  return (<TaskList service={props.service} pageSize={5} emptyMessage="There are no tasks." />);
};

export default Tasks;