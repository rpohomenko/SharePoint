import React from "react";
import BaseListView from "./BaseListView";
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import DepartmentCommand from "../commands/DepartmentCommand";

export class DepartmentList extends BaseListView {

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
    const { onItemSaving, onItemSaved, onItemDeleting, onItemDeleted, commandItems, style } = this.props;
    const { selection, canAddListItems } = this.state;
    return (
      <div className="departments-container" style={{
        height: 'calc(100vh - 160px)',
        position: 'relative'
      }}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
            <DepartmentCommand ref={ref => this._command = ref} canAddListItems={canAddListItems} commandItems={commandItems} service={this._service} selection={selection} onRefresh={() => this.refresh(true)}
              onItemDeleted={this._onItemDeleted} onItemSaved={this._onItemSaved} onItemSaving ={onItemSaving} onItemDeleting ={onItemDeleting} />
          </Sticky>{super.render()}
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
        key: 'shortName',
        name: 'Short Name',
        fieldName: 'ShortName',
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

  _fetchData = async (count, nextPageToken, sortBy, sortDesc, filter, options) => {
    return await this._service.getDepartments(count, nextPageToken, sortBy, sortDesc, filter, options);
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

const Departments = (props) => {
  return (<DepartmentList service={props.service} pageSize={10} emptyMessage="There are no departments." />);
};

export default Departments;