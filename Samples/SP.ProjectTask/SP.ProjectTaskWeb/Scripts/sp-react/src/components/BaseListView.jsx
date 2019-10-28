import React from "react";
import PropTypes from 'prop-types';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, ColumnActionsMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { IContextualMenuProps, IContextualMenuItem, DirectionalHint, ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import Constants from '../Constants';

export class BaseListView extends React.Component {

    _controllers = [];
    _timeout;

    constructor(props) {
        super(props);

        this._selection = new Selection({
            onSelectionChanged: () => {
                /*this.setState({
                  
                });*/
            }
        });

        this._onRenderMissingItem = this._onRenderMissingItem.bind(this);

        this.state = {
            items: [],
            columns: props.columns,
            count: props.pageSize,
            nextPageToken: null,
            isLoading: false
        };
    }

    getColumns = () => {
        throw "Not implemented getColumns method!";
    }

    _abort() {
        if (this._controllers != null) {
            this._controllers.forEach(c => {
                c.controller.abort();
            });

            this._controllers = [];
        }
        this._aborted = true;
    }

    _getKey = (item, index) => {
        return item ? item.key : null;
    }

    _onItemInvoked = (item) => {
        alert(`Item : ${item.Title}`);
    }

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

            this._abort();
            let _this = this;
            this._waitAll().then(() => {
                _this._aborted = false;
                _this.setState({
                    columns: newColumns,
                    items: [],
                    nextPageToken: null,
                    sortBy: column.name,
                    sortDesc: column.isSortedDescending
                });
                _this._loadItems(column, null);
            });
        }, Constants.SORT_COLUMN_DELAY);
    }

    fetchData = (count, nextPageToken, sortBy, sortDesc, filter, options) => {
        throw "Not implemented fetchData method!";
    }

    fetchDataAsync = async (count, nextPageToken, sortBy, sortDesc, filter, options) => {
        throw "Not implemented fetchDataAsync method!";
    }

    _loadItems = (sortColumn = null, pageToken = null) => {
        let { isLoading, count, filter, sortBy, sortDesc, nextPageToken, items } = this.state;
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
            nextPageToken: nextPageToken
        });
        let controller = new AbortController();
        const promise = this.fetchData(count, nextPageToken, sortBy, sortDesc, filter, { signal: controller ? controller.signal : null });
        if (controller)
            this._controllers.push({ controller: controller, promise: promise });
        promise.then(response => response.json())
            .catch((error) => {
                if (error.code !== 20 && error.name !== 'AbortError') { //aborted
                    alert(error);
                }
            })
            .then((json) => {
                let { nextPageToken, items } = this.state;
                if (json) {
                    let newItems = json.items;
                    if (items && items.length > 0 && nextPageToken) {
                        newItems = items.slice(0, items.length - 1).concat(newItems);
                    }
                    if (newItems && json._nextPageToken) {
                        newItems.push(null);
                    }
                    if (this._aborted === true) return;
                    if (controller && this._controllers.filter(c => c.controller == controller) === 0) return;
                    if (!newItems) {
                        newItems = [];
                    }
                    this.setState({
                        items: newItems,
                        nextPageToken: json._nextPageToken,
                        isLoading: false
                    });
                    this._selection.setItems(newItems);
                }
                this._controllers = this._controllers.filter(c => c.controller !== controller);
            })
            .catch((error) => {
                if (error.code !== 20 && error.name !== 'AbortError') { //aborted
                    alert(error);
                }
            });
    }

    _onRenderMissingItem = (index) => {
        let { nextPageToken } = this.state;
        if (nextPageToken) {
            this._waitAll().then(() => {
                let { isLoading, nextPageToken } = this.state;
                if (isLoading || !nextPageToken) return;
                this._loadItems(null, nextPageToken);
            });
        }
    }

    _waitAll = async () => {
        let promises = [];
        this._controllers.forEach(c => {
            promises.push(c.promise);
        });
        return await Promise.all(promises);
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

    componentDidMount() {
        if (!this.state.columns) {
            this.setState({ columns: this.getColumns() });
        }
        this._loadItems();
    }

    componentWillUnmount() {
        this._abort();
    }

    render() {
        const { columns, items, contextualMenuProps } = this.state;

        return (
            <div>
                <DetailsList
                    items={items}
                    compact={false}
                    columns={columns}
                    selectionMode={SelectionMode.none}
                    getKey={this._getKey}
                    setKey="none"
                    layoutMode={DetailsListLayoutMode.justified}
                    isHeaderVisible={true}
                    onItemInvoked={this._onItemInvoked}
                    onRenderMissingItem={this._onRenderMissingItem}
                />
                {contextualMenuProps && <ContextualMenu {...contextualMenuProps} />}
            </div>
        );
    }
}

BaseListView.propTypes = {
    pageSize: PropTypes.number  
}

BaseListView.defaultProps = {
    pageSize: 30
}

export default BaseListView;