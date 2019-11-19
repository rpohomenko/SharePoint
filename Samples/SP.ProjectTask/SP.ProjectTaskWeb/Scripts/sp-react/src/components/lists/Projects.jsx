import React from "react";
import BaseListView from "./BaseListView";
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import ProjectCommand from "../commands/ProjectCommand";

export class ProjectList extends BaseListView {

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
      <div className="projects-container" style={{
        height: '80vh',
        position: 'relative'
      }}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
            <ProjectCommand ref={ref => this._command = ref} service={this._service} selection={selection} onRefresh={() => this.refresh(true)}
              onItemDeleted={this._onItemDeleted} onItemSaved={this._onItemSaved} />
          </Sticky>{super.render()}
        </ScrollablePane>
      </div>
    );
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
      }      
    ];
    return columns;
  }

  _fetchData = async (count, nextPageToken, sortBy, sortDesc, filter, options) => {
    return await this._service.getProjects(count, nextPageToken, sortBy, sortDesc, filter, options);
  }

  _onSelectionChanged(selectionItems){
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

const Projects = (props) => {
  return (<ProjectList service={props.service} pageSize={30} emptyMessage="There are no projects." />);
};

export default Projects;