import React from "react";

import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { isNumber } from "util";
import BaseListView from "./BaseListView";
import TaskCommand from "../commands/TaskCommand";
import { ProjectFormPanel } from '../form/ProjectFormPanel';
import { LookupFieldRenderer } from '../form/fields/LookupFieldRenderer';
import { ChoiceFieldRenderer } from '../form/fields/ChoiceFieldRenderer';
import { DateFieldRenderer } from '../form/fields/DateFieldRenderer';
import { DateTimeFieldRenderer } from '../form/fields/DateTimeFieldRenderer';

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
    const { onItemSaving, onItemSaved, onItemDeleting, onItemDeleted, commandItems } = this.props;
    const { selection, canAddListItems } = this.state;
    return (
      <div className="tasks-container" style={{
        height: 'calc(100vh - 160px)',
        position: 'relative'
      }}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
            <TaskCommand ref={ref => this._command = ref} canAddListItems={canAddListItems} commandItems={commandItems} service={this._service} selection={selection} onRefresh={() => this.refresh(true)}
              onItemDeleted={this._onItemDeleted} onItemSaved={this._onItemSaved} onItemSaving={onItemSaving} onItemDeleting={onItemDeleting} />
          </Sticky>
          {super.render()}
        </ScrollablePane>
      </div>
    );
  }

  _onItemDeleted = (sender, result) => {
    const { onItemDeleted } = this.props;

    if (result.ok && result.data) {
      let deletedItems = result.data;
      let { items } = this.state;
      items = items.filter(item => {
        let found = false;
        for (let i = 0; i < deletedItems.length; i++) {
          if (deletedItems[i].Id === item.Id) {
            found = true;
            break;
          }
        }
        return !found;
      });
      this.setState({ items: items }, () => {
        if (typeof onItemDeleted === "function") {
          onItemDeleted(sender, result);
        }
      });
    }
  }

  _onItemSaved = (sender, result) => {
    const { onItemSaved } = this.props;
    if (result.ok && result.data) {
      /*if (!result.isNewItem) {
          let { items } = this.state;
          let index = items.findIndex(item => item.Id === result.data.Id);
          if (index > -1) {
              items[index] = result.data;
              this.setState({ items: items });
          }          
      }
      else*/
      this.refresh();

      if (typeof onItemSaved === "function") {
        onItemSaved(sender, result);
      }
    }
  }

  _getColumns = () => {
    const columns = [
      {
        key: 'title',
        name: 'Title',
        fieldName: 'Title',
        minWidth: 210,
        maxWidth: 350,
        isSortable: true,
        isRowHeader: false,
        isResizable: false,
        isSorted: false,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'A to Z',
        sortDescendingAriaLabel: 'Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: false
      },
      {
        key: 'project',
        name: 'Project',
        fieldName: 'Project',
        sortFieldName: 'ProjectTitle',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: false,
        isResizable: false,
        isSortable: true,
        isSorted: false,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'A to Z',
        sortDescendingAriaLabel: 'Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: false,
        getView: (lookupItem) => {
          if (lookupItem) {
            return <LookupFieldRenderer key='project' currentValue={lookupItem} fieldProps={{
              key: 'project',
              name: 'Project',
              type: 'lookup',
              title: 'Project',
              lookupList: 'Projects',
              lookupField: 'Title',
              isMultiple: false,
              required: true,
              renderListForm: (ref) => this._renderProjectListForm(ref)
            }} mode={0} />
          }
          return '';
        }
      },
      {
        key: 'status',
        name: 'Status',
        fieldName: 'TaskStatus',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: false,
        isResizable: false,
        isSortable: true,
        isSorted: false,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'A to Z',
        sortDescendingAriaLabel: 'Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: false,
        getView: (value) => {
          if (value) {
            return <ChoiceFieldRenderer key='status' currentValue={value} fieldProps={{
              key: 'status',
              name: 'TaskStatus',
              type: 'choice',
              choices: [
                { value: "Not Started", key: 1 },
                { value: "In Progress", key: 2 },
                { value: "Completed", key: 3 }
              ]
            }}
              mode={0} />
          }
          return '';
        }
      },
      {
        key: 'startDate',
        name: 'Start Date',
        fieldName: 'StartDate',
        minWidth: 210,
        maxWidth: 350,
        isSortable: true,
        isRowHeader: false,
        isResizable: true,
        isSorted: false,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'A to Z',
        sortDescendingAriaLabel: 'Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: false,
        getView: (lookupItem) => {
          if (lookupItem) {
            return <DateTimeFieldRenderer key='startDate' currentValue={lookupItem} fieldProps={{         
              type: 'datetime'
            }} mode={0} />
          }
          return '';
        }
      },
      {
        key: 'endDate',
        name: 'End Date',
        fieldName: 'DueDate',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: false,        
        isResizable: true,
        isSortable: true,
        isSorted: false,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'A to Z',
        sortDescendingAriaLabel: 'Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: false,
        getView: (lookupItem) => {
          if (lookupItem) {
            return <DateTimeFieldRenderer key='endDate' currentValue={lookupItem} fieldProps={{
              type: 'datetime'
            }} mode={0} />
          }
          return '';
        }
      }
    ];
    return columns;
  }

  _renderProjectListForm = (ref) => {
    return <ProjectFormPanel ref={ref} service={this.props.service}
      viewItemHeader="View Project" editItemHeader="Edit Project" newItemHeader="New Project"
      onItemDeleted={() => {
        this.refresh();
        if (this._command && this._command._status) {
          this._command._status.success("Deleted successfully.", this._command.props.STATUS_TIMEOUT);
        }
      }}
      onItemSaved={() => {
        this.refresh();
        if (this._command && this._command._status) {
          this._command._status.success("Saved successfully.", this._command.props.STATUS_TIMEOUT);
        }
      }}
      onItemLoaded={(sender, item) => {

      }}
    />;
  }

  _fetchData = async (count, nextPageToken, sortBy, sortDesc, filter, options) => {
    return await this._service.getTasks(count, nextPageToken, sortBy, sortDesc, filter, options);
  }

  _onSelectionChanged(selectionItems) {
    super._onSelectionChanged(selectionItems);
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

  async refresh(resetSorting, resetFiltering) {
    if (this._command) {
      this._command.setState({ refreshEnabed: false });
    }
    await super.refresh(resetSorting, resetFiltering);
    if (this._command) {
      this._command.setState({ refreshEnabed: true });
    }
  }
}

const Tasks = (props) => {
  return (<TaskList service={props.service} pageSize={10} emptyMessage="There are no tasks." />);
};

export default Tasks;