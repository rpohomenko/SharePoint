import React from "react";
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import Fullscreen from "react-full-screen";

import BaseListView from "./BaseListView";
import TaskCommand from "../commands/TaskCommand";
import { ProjectFormPanel } from '../form/ProjectFormPanel';
import { LookupFieldRenderer } from '../form/fields/LookupFieldRenderer';
import { ChoiceFieldRenderer } from '../form/fields/ChoiceFieldRenderer';
import { UserFieldRenderer } from '../form/fields/UserFieldRenderer';
import { DateTimeFieldRenderer } from '../form/fields/DateTimeFieldRenderer';
import { TaskSearchFormPanel } from '../search/TaskSearchFormPanel';

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
  }

  render() {
    return (
      <Fullscreen
        enabled={this.state.isFullScreen}
        onChange={isFullScreen => {
          if (this._command) {
            this._command.fullScreen(isFullScreen);
          }
        }}>
        <div className="tasks-container">
          {super.render()}
          <TaskSearchFormPanel ref={ref => this._filter = ref} service={this._service}
            fields={this._filterFields}
            onFilter={(filter) => {
              if (filter) {
                this._filterFields = filter.fields.map(field => field.props);
                this._onFilter(filter.expr || "");
              }
            }} />
        </div>
      </Fullscreen>
    );
  }

  _renderHeader = () => {
    const { onItemSaving, onItemSaved, onItemDeleting, onItemDeleted, commandItems } = this.props;
    const { selection, canAddListItems, filter } = this.state;
    return (<Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
      <TaskCommand ref={ref => this._command = ref} canAddListItems={canAddListItems} commandItems={commandItems} service={this._service} selection={selection}
        onClearSelection={() => {
          //this._onSelectionChanged(null);
          if (this._selection) {
            this._selection.setItems(this._selection.getItems(), true);
          }
        }}
        clearFilterShown={!!filter}
        onSearch={(expr, props) => {
          if (props) {
          }
          if (!expr) {
            expr = "";
            this._filterFields = null;
          }
          else if (filter) {
            expr = `${expr} && ${filter}`;
          }
          this._onFilter(expr);
        }}
        searchField={
          {
            key: 'title',
            name: 'Title',
            filterComparison: 3,
            value: ''
          }
        }
        onSetFilter={() => { if (this._filter) { this._filter.showHide(); } }}
        onClearFilter={() => { this._filterFields = null; this._onFilter(""); }}
        onRefresh={() => this.refresh(true)}
        onFullScreen = {(enabled)=> this.setState({isFullScreen: enabled})}
        onViewChanged={(isCompact) => this.setState({ isCompact: isCompact })}
        onItemDeleted={this._onItemDeleted} onItemSaved={this._onItemSaved} onItemSaving={onItemSaving} onItemDeleting={onItemDeleting} />
    </Sticky>);
  };

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
        isResizable: true,
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
        groupFieldName: 'ProjectTitle',
        isGroupingEnabled: true,
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
          if (lookupItem && lookupItem.Id) {
            return <LookupFieldRenderer key='project' currentValue={lookupItem} fieldProps={{
              key: 'project',
              name: 'Project',
              type: 'lookup',
              title: 'Project',
              lookupList: 'Projects',
              lookupField: 'Title',
              isMultiple: false,
              required: true,
              renderListForm: (ref, itemId) => this._renderProjectListForm(ref, itemId)
            }} mode={0} />
          }
          return lookupItem;
        }
      },

      {
        key: 'assignedTo',
        name: 'Assigned To',
        fieldName: 'AssignedTo',     
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: false,
        isResizable: true,
        isSortable: false,
        isSorted: false,
        isMultiline: true,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'A to Z',
        sortDescendingAriaLabel: 'Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: false,
        getView: (value) => {
          if (value) {
            return <UserFieldRenderer key='assignedTo' currentValue={value} fieldProps={{
              type: 'user',
              isMultiple: true
            }}
              mode={0} />
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
        isGroupingEnabled: true,
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

  _renderProjectListForm = (ref, itemId) => {
    return <ProjectFormPanel ref={ref} itemId={itemId} service={this.props.service}
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

  _fetchData = async (count, nextPageToken, sortBy, groupBy, filter, options) => {
    return await this._service.getTasks(count, nextPageToken, sortBy, groupBy, filter, null, options);
  }

  _onSelectionChanged(selectionItems) {
    super._onSelectionChanged(selectionItems);
    if (this._command) {
      this._command.setState({ selection: selectionItems });
    }
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

  search(columnName, term) {
    super.search(columnName, term);
  }

  async loadItems(sortColumn, reload, newFilter) {
    if (this._command) {
      this._command.setState({ refreshEnabed: false });
    }
    return await super.loadItems(sortColumn, reload, newFilter).then(result => {
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
    });
  }
}

const Tasks = (props) => {
  return (<TaskList service={props.service} pageSize={(props.pageSize || window._isMobile ? 10 : 20)} emptyMessage="There are no tasks." />);
};

export default Tasks;