import React from "react";

import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { Link } from 'office-ui-fabric-react/lib/Link';

import BaseListView from "./BaseListView";
import TaskCommand from "../commands/TaskCommand";
import { ProjectFormPanel } from '../form/ProjectFormPanel';
import { isNumber } from "util";

export class TaskList extends BaseListView {

  constructor(props) {
    super(props);
    this._service = props.service;
    this.state = {
      ...this.state
    };
    this._projectFormPanel = React.createRef();
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
    const { selection, listFormItemId, listFormItem } = this.state;
    return (
      <div className="tasks-container" style={{
        height: '80vh',
        position: 'relative'
      }}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
            <TaskCommand ref={ref => this._command = ref} commandItems={commandItems} service={this._service} selection={selection} onRefresh={() => this.refresh(true)}
              onItemDeleted={this._onItemDeleted} onItemSaved={this._onItemSaved} onItemSaving={onItemSaving} onItemDeleting={onItemDeleting} />
          </Sticky>
          {super.render()}
          {this._renderProjectForm(listFormItemId, listFormItem, this._projectFormPanel)}
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
        isPadded: false,
        getView: (lookupItem) => {
          if (lookupItem) {
            let panel = this._projectFormPanel; //React.createRef();
            return (
              <div className="lookup-item">
                <Link onClick={(e) => this._showForm(panel, lookupItem.Id)}>{lookupItem.Value}</Link>
                {/*this._renderProjectForm(lookupItem.Id, null, panel)*/}
              </div>);
          }
          return '';
        }
      }
    ];
    return columns;
  }

  _showForm = (panel, itemId) => {
    if (panel && panel.current) {      
      if (isNumber(itemId)) {
        this.setState({ listFormItemId: itemId }, ()=>{
          panel.current.open(0);
        });
      }    
    }
  }

  _renderProjectForm = (itemId, item, ref) => {
    return <ProjectFormPanel ref={ref} service={this.props.service}
      itemId={itemId} item={item}
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
        this.setState({listFormItem: item});
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
  return (<TaskList service={props.service} pageSize={30} emptyMessage="There are no tasks." />);
};

export default Tasks;