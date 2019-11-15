import React from "react";
import PropTypes from 'prop-types';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, ColumnActionsMode } from 'office-ui-fabric-react/lib/DetailsList';
import { ShimmeredDetailsList } from 'office-ui-fabric-react/lib/ShimmeredDetailsList';
import { DirectionalHint, ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
//import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { ActionButton, IIconProps } from 'office-ui-fabric-react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { getId } from 'office-ui-fabric-react/lib/Utilities';

export class BaseListView extends React.Component {

    _controllers = [];
    _timeout;

    constructor(props) {
        super(props);

        this._selection = new Selection({
            onSelectionChanged: () => this._onSelectionChanged(this._getSelectionItems())
        });

        this._onRenderMissingItem = this._onRenderMissingItem.bind(this);
        this._onRenderCustomPlaceholder = this._onRenderCustomPlaceholder.bind(this);
        this._onSelectionChanged = this._onSelectionChanged.bind(this);

        this.state = {
            items: [],
            columns: props.columns,
            count: props.pageSize,
            nextPageToken: null,
            isLoading: false
        };

        this._nextActionHostId = getId('nextActionHost');
    }

    async componentDidMount() {
        if (!this.state.columns) {
            this.setState({ columns: this._getColumns() });
        }
        await this.loadItemsAsync();
    }

    async componentWillUnmount() {
        await this._abort();
    }

    render() {
        let { emptyMessage } = this.props;
        let { columns, items, contextualMenuProps, nextPageToken, isLoading, isLoaded, error, count } = this.state;

        return (
            <div className="list-view-container">
                {
                    error &&
                    (<MessageBar messageBarType={MessageBarType.error} isMultiline={false} onDismiss={() => {
                        this.setState({ error: undefined });
                    }} dismissButtonAriaLabel="Close">
                        {error.message}
                    </MessageBar>)
                }
                <MarqueeSelection selection={this._selection}>
                    <ShimmeredDetailsList
                        ref={ref => this._list = ref}
                        items={items}
                        compact={false}
                        columns={columns}
                        selection={this._selection}
                        onItemInvoked={this._onItemInvoked}
                        onItemContextMenu={this._onItemContextMenu}
                        onRenderMissingItem={this._onRenderMissingItem}
                        onRenderCustomPlaceholder={this._onRenderCustomPlaceholder}
                        enableShimmer={(!isLoaded && items.length === 0)}
                    />
                </MarqueeSelection>
                {isLoaded && items.length === 0 && !isLoading && !error && (<Stack horizontalAlign="center" styles={{ root: { padding: 10 } }}>{emptyMessage}</Stack>)}
                {contextualMenuProps && <ContextualMenu {...contextualMenuProps} />}
                {isLoaded && nextPageToken && (<TooltipHost
                    content={`Next ${count} item(s)`}
                    id={this._nextActionHostId}
                    calloutProps={{ gapSpace: 0 }}
                    styles={{ root: { display: 'inline-block' } }}>
                    <ActionButton iconProps={{ iconName: 'Next' }} aria-describedby={this._nextActionHostId} onClick={() =>
                        this._waitAll().then(() => this.loadItemsAsync())} />
                </TooltipHost>)
                  /*isLoading && (<Stack horizontalAlign="center" styles={{ root: { padding: 10 } }}><Spinner size={SpinnerSize.medium} /></Stack>)*/}
            </div>
        );
    }

    _getColumns = () => {
        throw "Method _getColumns is not yet implemented!";
    }

    _getSelectionItems = () => {
        return this._selection.getSelection();
    }

    _onSelectionChanged = (selectionItems) => {
        this.setState({ selection: selectionItems });
    }

    async _abort() {
        if (this._controllers != null) {
            try {
                this._controllers.forEach(c => {
                    c.controller.abort();
                });
                await this._waitAll()
            }
            catch{ }
            this._controllers = [];
            this._aborted = true;
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

    _onSortColumn = (column) => {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        this._timeout = setTimeout(() => {
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

            this._abort().then(() => {
                this._aborted = false;
                this.setState({
                    columns: newColumns,
                    items: [],
                    nextPageToken: null,
                    sortBy: column.name,
                    sortDesc: column.isSortedDescending
                });
                this.loadItems(column, null);
            });
        }, this.props.SORT_COLUMN_DELAY);
    }

    _onRenderMissingItem = (index, rowProps) => {
        /*let { items, isLoading, isLoaded, nextPageToken } = this.state;
        if (nextPageToken && index >= items.length - 1) {
            if (isLoading || !isLoaded || this._controllers.length > 0) return null;           
            this.loadItemsAsync(null, nextPageToken);

        }*/
        return null;
    }

    _onRenderCustomPlaceholder = (rowProps, index, renderShimmerPlaceholder) => {
        renderShimmerPlaceholder(rowProps);
        //return this._onRenderMissingItem(index, rowProps);
    }

    _getContextualMenuProps = (ev, column) => {
        const items = [
            {
                key: 'aToZ',
                name: column.sortAscendingAriaLabel,
                iconProps: { iconName: 'SortUp' },
                canCheck: true,
                checked: column.isSorted && !column.isSortedDescending,
                onClick: () => { column.isSortedDescending = false; this._onSortColumn(column) }
            },
            {
                key: 'zToA',
                name: column.sortDescendingAriaLabel,
                iconProps: { iconName: 'SortDown' },
                canCheck: true,
                checked: column.isSorted && column.isSortedDescending,
                onClick: () => { column.isSortedDescending = true; this._onSortColumn(column) }
            }
        ];
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

    _fetchData = (count, nextPageToken, sortBy, sortDesc, filter, options) => {
        throw "Method _fetchData is not yet implemented!";
    }

    _fetchDataAsync = async (count, nextPageToken, sortBy, sortDesc, filter, options) => {
        throw "Method _fetchDataAsync is not yet implemented!";
    }

    refresh = async (resetSorting, resetFiltering) => {
        await this._abort();
        this._aborted = false;
        let { columns, sortBy, sortDesc } = this.state;
        if (resetSorting) {
            columns = columns.slice();
            columns.forEach((newCol) => {
                newCol.isSorted = false;
                newCol.isSortedDescending = false;
            });
            sortBy = undefined;
            sortDesc = undefined;
        }
        this.setState({
            items: [],
            nextPageToken: undefined,
            sortBy: sortBy,
            sortDesc: sortDesc,
            columns: columns
        });
        await this.loadItemsAsync(null, null);
    }

    loadItemsAsync = async (sortColumn = null, pageToken = null) => {
        await this.loadItems(sortColumn, pageToken);
    }

    loadItems(sortColumn = null, pageToken = null) {
        let { count, filter, sortBy, sortDesc, nextPageToken, items } = this.state;
        if (this._aborted === true) return;

        if (sortColumn) {
            sortBy = sortColumn.name;
            sortDesc = sortColumn.isSortedDescending;
        }
        if (pageToken) {
            nextPageToken = pageToken
        }

        this.setState({
            isLoading: true,
            isLoaded: false,
            nextPageToken: nextPageToken,
            error: undefined
        });
        if (!nextPageToken) {
            this.setState({
                items: []
            });
        }
        else {
            this.setState({
                items: items.concat(new Array(count))
            });
        }
        let controller = new AbortController();
        const promise = this._fetchDataAsync(count, nextPageToken, sortBy, sortDesc, filter, { signal: controller ? controller.signal : null });
        this._controllers.push({ controller: controller, promise: promise });

        return promise.then(response => {
            if (response.ok) {
                return response.json().then((json) => {
                    let { items } = this.state;
                    if (json) {
                        let itemsCopy = (nextPageToken ? items.splice(0, items.length - count) : items.splice(0, items.length)).concat(json.items);

                        if (this._aborted === true) return;
                        if (this._controllers.filter(c => c.controller == controller) === 0) return;
                        this.setState({
                            items: itemsCopy,
                            nextPageToken: json._nextPageToken,
                            isLoading: false,
                            isLoaded: true
                        });
                        //this._selection.setItems(itemsCopy);
                    }
                    else {
                        this.setState({
                            isLoading: false,
                            isLoaded: true
                        });
                    }
                    this._controllers = this._controllers.filter(c => c.controller !== controller);
                    return 1; // OK
                });
            }
            else {
                return response.json().then((error) => {
                    if (!error || !error.message) {
                        error = { message: `${response.statusText} (${response.status})` };
                    }
                    this.setState({
                        error: error,
                        isLoading: false
                    });
                    return 0; //error
                }).catch(() => {
                    let error = { message: `${response.statusText} (${response.status})` };
                    this.setState({
                        error: error,
                        isLoading: false
                    });
                    return 0; //error
                });
            }
        }).catch((error) => {
            if (error.code !== 20 && error.name !== 'AbortError') { //aborted
                this.setState({
                    error: error,
                    isLoading: false
                });
            }
        });
    }
}

BaseListView.propTypes = {
    pageSize: PropTypes.number,
    SORT_COLUMN_DELAY: PropTypes.number,
    emptyMessage: PropTypes.string
}

BaseListView.defaultProps = {
    pageSize: 30,
    SORT_COLUMN_DELAY: 700,
    emptyMessage: "There are no items."
}

export default BaseListView;