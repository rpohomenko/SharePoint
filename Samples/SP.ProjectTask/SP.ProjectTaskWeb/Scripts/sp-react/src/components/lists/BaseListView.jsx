import React from "react";
import PropTypes from 'prop-types';
import { /*DetailsList, DetailsListLayoutMode,*/ Selection, SelectionMode, ColumnActionsMode } from 'office-ui-fabric-react/lib/DetailsList';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import { DirectionalHint, ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
//import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { ActionButton } from 'office-ui-fabric-react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { Callout } from 'office-ui-fabric-react';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { StatusBar } from '../StatusBar';

export class BaseListView extends React.Component {

    _controllers = [];
    _timeout;

    constructor(props) {
        super(props);

        this._selection = new Selection({
            onSelectionChanged: () => this._onSelectionChanged(this._getSelectionItems())
        });

        this._renderMissingItem = this._renderMissingItem.bind(this);
        this._renderCustomPlaceholder = this._renderCustomPlaceholder.bind(this);
        this._onSelectionChanged = this._onSelectionChanged.bind(this);

        this.state = {
            items: [],
            columns: props.columns,
            count: props.pageSize,
            nextPageToken: null,
            isLoading: false
        };

        this._nextActionHostId = getId('nextActionHost');
        this._container = React.createRef();
        this._list = React.createRef();
    }

    async componentDidMount() {
        if (!this.state.columns) {
            this.setState({ columns: this._getColumns() });
        }
        await this.loadItems();
    }

    async componentWillUnmount() {
        await this._abort();
    }

    render() {
        const { isMultipleSelection } = this.props;
        const { columns, contextualMenuProps, items, groups, isLoading, isLoaded, count, isCompact } = this.state;
        return (
            <div className="list-view-container" ref={this._container} ref={(ref) => this._scrollParentRef = ref}>
                <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                    {this._renderHeader()}
                    <StatusBar ref={ref => this._status = ref} />
                    {isLoading &&
                        (<Callout
                            target={this._container.current}
                            setInitialFocus={true}>
                            <Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}>
                                <ProgressIndicator label={"Loading..."} />
                            </Stack>
                        </Callout>)}
                    <MarqueeSelection selection={this._selection}>
                        <ShimmeredDetailsList
                            listProps={{
                                ref: this._list,
                                onRenderPage: (props, defaultRender) => this._renderPage(props, defaultRender),
                                getItemCountForPage: () => {
                                    return count;
                                }
                            }}
                            items={items}
                            groups={groups}
                            groupProps={{
                                onRenderHeader: this._renderGroupHeader                           
                              }}
                            setKey="items"
                            compact={isCompact}
                            columns={columns}
                            selection={this._selection}
                            selectionMode={isMultipleSelection ? SelectionMode.multiple : SelectionMode.single}
                            onItemInvoked={this._onItemInvoked}
                            onItemContextMenu={this._onItemContextMenu}
                            onRenderMissingItem={this._renderMissingItem}
                            onRenderCustomPlaceholder={this._renderCustomPlaceholder}
                            enableShimmer={(!isLoaded && items.length === 0)}
                            onRenderDetailsHeader={this._renderDetailsHeader}
                            onRenderItemColumn={this._renderItemColumn}
                            onRenderDetailsFooter={this._renderDetailsFooter}
                            onRenderRow={this._renderRow}
                        />
                    </MarqueeSelection>
                    {contextualMenuProps && <ContextualMenu {...contextualMenuProps} />}
                </ScrollablePane>
            </div>
        );
    }

    _renderHeader = () => {
    }

    _renderGroupHeader = (props, defaultRender) => {
        return defaultRender(props);
    }

    _renderRow = (props, defaultRender) => {
        return defaultRender(props);
    }

    _renderPage(props, defaultRender) {
        return defaultRender(props, defaultRender);
    }

    _renderItemColumn(item, index, column) {
        let value;
        if (typeof column.getView === "function") {
            value = column.getView(item[column.fieldName], item, index);
        }
        else {
            value = item && column && column.fieldName ? item[column.fieldName] : '';
        }

        if (value === null || value === undefined) {
            value = '';
        }

        if (typeof value === 'boolean') {
            return value.toString();
        }
        return value;
    }

    _renderDetailsHeader = (props, defaultRender) => {
        const { items, isLoaded } = this.state;
        if(isLoaded && items.length === 0) return null;
        return (<Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
            {defaultRender({
                ...props
            })}
        </Sticky>);
    }

    _renderDetailsFooter = (props) => {
        const { emptyMessage } = this.props;
        const { items, nextPageToken, isLoading, isLoaded, count } = this.state;
        return (<Sticky stickyPosition={StickyPositionType.Footer} isScrollSynced={true}>
            {isLoaded && items.length === 0 && !isLoading && (<Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}>{emptyMessage}</Stack>)}
            {isLoaded && nextPageToken && (<TooltipHost
                content={"Next {0} item(s)".format(count)}
                id={this._nextActionHostId}
                calloutProps={{ gapSpace: 0 }}
                styles={{ root: { display: 'inline-block' } }}>
                <ActionButton iconProps={{ iconName: 'Refresh' }} aria-describedby={this._nextActionHostId} onClick={() =>
                    this._waitAll().then(() => this.loadItems())}>{"Next {0}".format(count)}</ActionButton>
            </TooltipHost>)}
        </Sticky>)
    }

    _getColumns = () => {
        throw "Method _getColumns is not yet implemented!";
    }

    _getSelectionItems = () => {
        const { isLoaded } = this.state;
        return isLoaded ? this._selection.getSelection() : null;
    }

    _onSelectionChanged(selectionItems) {
        const { onSelect } = this.props;
        const { isLoaded } = this.state;
        if (isLoaded) {
            this.setState({ selection: selectionItems }, () => {
                if (typeof onSelect === "function") {
                    onSelect(selectionItems);
                }
            });
        }
    }

    _abort = async () => {
        this._isLoading = false;
        if (this._controllers != null) {
            try {
                this._controllers.forEach(c => {
                    c.controller.abort();
                });
                await this._waitAll()
            }
            catch{ }
            this._controllers = [];
        }
    }

    _waitAll = async () => {
        let promises = [];
        this._controllers.forEach(c => {
            promises.push(c.promise);
        });
        if (promises.length > 0) {
            return await Promise.all(promises);
        }
    }

    _setTimeout = async (func, ms) => {
        this._clearTimeout();

        return await new Promise(resolve => this._timeout = setTimeout(() => {
            if (typeof func === "function") {
                func();
            }
            resolve()
        }, ms));
    }

    _clearTimeout = () => {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
    }

    /*_getKey = (item, index) => {
        return item ? item.key : null;
    }*/

    _onItemInvoked = (item) => {
        throw "Method _onItemInvoked is not yet implemented!";
    }

    _onEditItem(item) {
        throw "Method _onEditItem is not yet implemented!";
    }

    _onDeleteItem(item) {
        throw "Method _onDeleteItem is not yet implemented!";
    }

    _onItemContextMenu = (item, index, ev) => {
        const contextualMenuProps = {
            target: ev.target,
            items: [
                {
                    key: 'viewItem',
                    icon: 'View',
                    name: 'View',
                    onClick: (e, sender) => this._onItemInvoked(item),
                    iconProps: {
                        iconName: 'View'
                    },
                    ariaLabel: 'View'
                },
                {
                    key: 'editItem',
                    icon: 'Edit',
                    name: 'Edit',
                    onClick: (e, sender) => this._onEditItem(item),
                    iconProps: {
                        iconName: 'Edit'
                    },
                    ariaLabel: 'Edit'
                },
                {
                    key: 'deleteItem',
                    icon: 'Delete',
                    name: 'Delete',
                    onClick: (e, sender) => this._onDeleteItem(item),
                    iconProps: {
                        iconName: 'Delete'
                    },
                    ariaLabel: 'Delete'
                }
            ],
            onDismiss: () => {
                this.setState({
                    contextualMenuProps: undefined
                });
            }
        };

        if (index > -1) {
            this.setState({
                contextualMenuProps: contextualMenuProps
            });
        }

        return false;
    };

    _onColumnClick = (ev, column) => {
        if (column.columnActionsMode !== ColumnActionsMode.disabled) {
            this.setState({
                contextualMenuProps: this._getContextualMenuProps(ev, column)
            });
        }
    };

    async sortColumn(column, isSortedDescending) {
        column.isSortedDescending = isSortedDescending;
        return await this._setTimeout(async() =>{
            const { columns, items } = this.state;
            const newColumns = columns.slice();
            const currColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
            newColumns.forEach((newCol) => {
                if (newCol === currColumn) {
                    currColumn.isSortedDescending = column.isSortedDescending;
                    currColumn.isSorted = true;
                } else {
                    newCol.isSorted = false;
                    newCol.isSortedDescending = true;
                }
            });
            this.setState({
                columns: newColumns,
                /*items: [],
                nextPageToken: null,*/
                sortBy: column.sortFieldName || column.fieldName,
                sortDesc: column.isSortedDescending
            });
            await this._abort();
            return await this.loadItems(column, null);
        }, this.props.RELOAD_DELAY);
    }

    async groupColumn(column) {
        return await this._setTimeout(async() => {
            const { columns, groupBy } = this.state;
            const newColumns = columns.slice();
            const currColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
            newColumns.forEach((newCol) => {
                if (newCol === currColumn) {                    
                    currColumn.isGrouped = (groupBy === (column.groupFieldName || column.fieldName)) ? false : true;
                } else {
                    newCol.isGrouped = false;
                }
            });
            this.setState({
                columns: newColumns,
                groupColumn: column,
                groupBy: (groupBy === (column.groupFieldName || column.fieldName)) ? null : (column.groupFieldName || column.fieldName)
            });
            await this._abort();
            return await this.loadItems(null, null, null, column);
        }, this.props.RELOAD_DELAY);
    }

    _renderMissingItem = (index, rowProps) => {
        /*let { items, isLoading, isLoaded, nextPageToken } = this.state;
        if (nextPageToken && index >= items.length - 1) {
            if (isLoading || !isLoaded || this._controllers.length > 0) return null;           
            this.loadItems();

        }*/
        return null;
    }

    _renderCustomPlaceholder = (rowProps, index, renderShimmerPlaceholder) => {
        renderShimmerPlaceholder(rowProps);
        return this._renderMissingItem(index, rowProps);
    }

    _getContextualMenuProps = (ev, column) => {
        const items = [
            {
                key: 'aToZ',
                name: column.sortAscendingAriaLabel,
                iconProps: { iconName: 'SortUp' },
                canCheck: column.isSortable,
                disabled: !column.isSortable,
                checked: column.isSorted && !column.isSortedDescending,
                onClick: () => this.sortColumn(column, false)
            },
            {
                key: 'zToA',
                name: column.sortDescendingAriaLabel,
                iconProps: { iconName: 'SortDown' },
                canCheck: column.isSortable,
                disabled: !column.isSortable,
                checked: column.isSorted && column.isSortedDescending,
                onClick: () => this.sortColumn(column, true)
            }
        ];
        if(column.isGroupingEnabled){
            items.push({
                key: 'groupBy',
                name: 'Group By',
                iconProps: { iconName: 'GroupList' },
                canCheck: true,             
                checked: column.isGrouped,
                onClick: () => this.groupColumn(column)
            });
        }
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

    _fetchData = (count, nextPageToken, sortBy, groupBy, filter, options) => {
        throw "Method _fetchData is not yet implemented!";
    }

    async refresh(resetSorting, resetFiltering, resetGrouping) {
        //await this._setTimeout(null, this.props.RELOAD_DELAY);
        await this._abort();
        const { isLoading } = this.state;
        if (isLoading) return;
        let { columns, sortBy, sortDesc, groupBy, filter } = this.state;
        if (resetSorting) {
            columns = columns.slice();
            columns.forEach((newCol) => {
                newCol.isSorted = false;
                newCol.isSortedDescending = false;
            });
            sortBy = undefined;
            sortDesc = undefined;
        }
        if (resetFiltering) {
            filter = undefined;
        }
        if(resetGrouping){
            columns = columns.slice();
            columns.forEach((newCol) => {
                newCol.isGrouped = false;               
            });
            groupBy = undefined;
        }
        this.setState({
            items: [],
            nextPageToken: undefined,
            sortBy: sortBy,            
            sortDesc: sortDesc,
            groupBy: groupBy,
            columns: columns,
            filter: filter
        });
        return await this.loadItems(null, true, null, null);
    }

    _onFilter = async (filter) => {
        await this._abort();
        return await this.loadItems(null, true, filter);
    }

    async loadItems(sortColumn = null, reload = false, newFilter = null, groupColumn = null) {

        let { count, filter, sortBy, sortDesc, groupBy, nextPageToken, items, isLoading } = this.state;

        if (this._isLoading || isLoading) return;

        if (sortColumn !== null) {
            sortBy = sortColumn.sortFieldName || sortColumn.fieldName;
            sortDesc = sortColumn.isSortedDescending;
        }
        if (groupColumn !== null) {
            groupBy = groupColumn.groupFieldName || groupColumn.fieldName;           
        }
        if (reload) {
            nextPageToken = null;
        }
        if (newFilter !== null) {
            nextPageToken = null;
            filter = newFilter;
        }

        this._isLoading = true;
        this.setState({
            isLoading: true,
            isLoaded: false,
            nextPageToken: nextPageToken,
            filter: filter
        });
        if (this._status) {
            this._status.clear();
        }
        if (!nextPageToken) {
            items = [];
            this.setState({
                items: items.concat(new Array(count)),
                groups: null
            }, () => {
                this._selection.setItems([], true);
                this._onSelectionChanged([]);
            });
        }
        else {
            this.setState({
                items: items.concat(new Array(count)),
                groups: null
            });
        }
        let controller = new AbortController();
        const promise = this._fetchData(count, nextPageToken, sortBy ? `${sortBy}${(sortDesc ? ' DESC' : '')}` : null, groupBy, filter, { signal: controller ? controller.signal : null });
        this._controllers.push({ controller: controller, promise: promise });

        return await this._onPromise(promise, (json) => {
            this.setState({
                isLoading: false,
                isLoaded: true
            });
            let itemsCopy = [...items];
            if (json) {
                itemsCopy = (!!nextPageToken ? itemsCopy.splice(0, items.length - 1) : []).concat(json.items);

                if (this._controllers.filter(c => c.controller == controller) === 0) return;

                if (!!json._nextPageToken) {
                    itemsCopy.push(null);
                }

                this.setState({
                    items: itemsCopy,
                    nextPageToken: json._nextPageToken,
                    canAddListItems: json._canAddListItems
                });

                if (!!groupBy) {
                    const { groupColumn } = this.state;
                    let groupedItems = this._generateGroupsFromArray(itemsCopy, groupBy);
                    let groups = [];

                    for (let i = 0; i < itemsCopy.length; i++) {
                        let item = itemsCopy[i];
                        for (let groupKey in groupedItems) {
                            if (groups.filter(group => group.key === groupKey).length === 0) {
                                let group = groupedItems[groupKey];
                                if (group.indexOf(item) > -1) {
                                    let groupName = groupKey;
                                    if (typeof groupColumn.getView === "function") {
                                        groupName = groupColumn.getView(item[groupBy]);
                                    }
                                    groups.push({
                                        key: groupKey,
                                        name: groupName,
                                        startIndex: i,
                                        count: group.length,
                                        isCollapsed: /*true*/ false
                                    });                                   
                                }
                            }
                        }
                    }
                
                    this.setState({
                        groups: groups
                    });
                }
                //this._selection.setItems(itemsCopy);
            }

            this._controllers = this._controllers.filter(c => c.controller !== controller);
            return { ok: true, data: itemsCopy }; // OK
        }).then((result) => {
            this._isLoading = false;
            this.setState({
                isLoading: false
            });
            return result;
        });
    }

    _generateGroupsFromArray = (items, groupBy) => {
        return items.reduce((groups, item, index) => {
            (groups[item[groupBy]] = groups[item[groupBy]] || []).push(item);                 
            return groups;        
        }, {});
    }

    _onPromise = async (promise, onSuccess) => {
        if (promise) {
            return await promise.then(response => {
                if (response.ok) {
                    return response.json().then(onSuccess);
                }
                else {
                    return response.json().then((error) => {
                        if (!error || !error.message) {
                            error = { message: `${response.statusText} (${response.status})` };
                        }
                        throw error;
                    }).catch((error) => {
                        if (!error || !error.message) {
                            throw { message: error };
                        }
                        throw error;
                    });
                }
            }).catch((error) => {
                if (error.code !== 20 && error.name !== 'AbortError') { //aborted
                    if (this._status) {
                        this._status.error(error.message ? error.message : error);
                    }
                }
                return { ok: false, data: error }; //error
            });
        }
    }
}

BaseListView.propTypes = {
    pageSize: PropTypes.number,
    RELOAD_DELAY: PropTypes.number,
    emptyMessage: PropTypes.string,
    isMultipleSelection: PropTypes.bool
}

BaseListView.defaultProps = {
    pageSize: 30,
    RELOAD_DELAY: 500,
    emptyMessage: "There are no items.",
    isMultipleSelection: true
}

export default BaseListView;