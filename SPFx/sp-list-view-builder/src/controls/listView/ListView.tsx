import * as React from 'react';
import { DetailsList, ColumnActionsMode, DetailsListLayoutMode, Selection, SelectionMode, IColumn, IGroup, IGroupRenderProps } from 'office-ui-fabric-react/lib/DetailsList';
import { DirectionalHint, ContextualMenu, IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IListViewProps, IListViewState, IViewColumn, IGrouping, GroupOrder } from './IListView';
import { findIndex, has, isEqual, sortBy } from '@microsoft/sp-lodash-subset';

interface IGroupsItems {
    items: any[];
    groups: IGroup[];
}

export class ListView extends React.Component<IListViewProps, IListViewState> {
    private _selection: Selection;

    constructor(props: IListViewProps) {
        super(props);

        // Initialize state
        this.state = {
            items: [],
            flattenItems: []
        };

        if (this.props.selection) {
            // Initialize the selection
            this._selection = new Selection({
                // Create the event handler when a selection changes
                onSelectionChanged: () => this.props.onSelect(this._selection.getSelection())
            });
        }
    }

    /**
     * Lifecycle hook when component is mounted
     */
    public componentDidMount(): void {
        this.updateState(this.props.items);
    }

    /**
     * Lifecycle hook when component did update after state or property changes
     * @param prevProps
     * @param prevState
     */
    public componentDidUpdate(prevProps: IListViewProps, prevState: IListViewState): void {

        if (!isEqual(prevProps, this.props)) {
            // Reset the selected items
            if (this._selection) {
                this._selection.setItems(this.props.items, true);
            }
            this.updateState(this.props.items);
        }
    }

    protected updateState(items: any[]) {
        const { columns } = this.props;
        this.setState({
            items: (typeof items !== 'undefined' && items !== null) ? [...items] : [],
            flattenItems: (typeof items !== 'undefined' && items !== null) ? this._flattenItems(items) : [],
            columns: (typeof columns !== 'undefined' && columns !== null) ? this._createColumns(columns) : []
        });
    }

    /**
 * Flatten all objects in every item
 * @param items
 */
    private _flattenItems(items: any[]): any[] {
        if (!items) return [];
        // Flatten items
        const flattenItems = items.map(item => {
            // Flatten all objects in the item
            return this._flattenItem(item);
        });
        return flattenItems;
    }

    /**
     * Flatten all object in the item
     * @param item
     */
    private _flattenItem(item: any): any {
        let flatItem = {};
        for (let parentPropName in item) {
            // Check if property already exists
            if (!item.hasOwnProperty(parentPropName)) continue;

            // Check if the property is of type object
            if ((typeof item[parentPropName]) === 'object') {
                // Flatten every object
                const flatObject = this._flattenItem(item[parentPropName]);
                for (let childPropName in flatObject) {
                    if (!flatObject.hasOwnProperty(childPropName)) continue;
                    flatItem[`${parentPropName}.${childPropName}`] = flatObject[childPropName];
                }
            } else {
                flatItem[parentPropName] = item[parentPropName];
            }
        }
        return flatItem;
    }

    private _createColumns(columns: IViewColumn[]): IViewColumn[] {
        const viewColumns: IViewColumn[] = [...columns];
        viewColumns.forEach(column => {
            const onColumnClick = column.onColumnClick;
            column.onColumnClick = (ev, col) => this.onColumnClick(ev, col, onColumnClick);
            const onColumnRender =  column.onRender;
            column.onRender = (item, index, col) => this.onColumnRender(item, index, col, onColumnRender);
        });
        return viewColumns;
    }

    protected onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn, onColumnClick: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => void): void => {
        if (typeof onColumnClick === "function") {
            onColumnClick(ev, column);
        }
        else {
            if (column.columnActionsMode !== ColumnActionsMode.disabled) {
                this.setState({
                    columnContextualMenuProps: this.getColumnContextualMenuProps(ev, column)
                });
            }
        }
    }

    protected onColumnRender(item: any, index: number, column: IColumn, onRender?: (item?: any, index?: number, column?: IColumn) => any) {
        if (typeof onRender === "function") {
            item = this.state.items[index];
            return onRender(item, index, column);
        }
        return item[column.fieldName];
    }

    protected getColumnContextualMenuProps(ev: React.MouseEvent<HTMLElement>, column: IViewColumn): IContextualMenuProps {
        const items = [
            {
                key: 'aToZ',
                name: "A to Z",
                iconProps: { iconName: 'SortUp' },
                canCheck: column.sortable,
                disabled: !column.sortable,
                checked: column.isSorted && !column.isSortedDescending,
                onClick: () => this.sortByColumn(column, false)
            },
            {
                key: 'zToA',
                name: "Z to A",
                iconProps: { iconName: 'SortDown' },
                canCheck: column.sortable,
                disabled: !column.sortable,
                checked: column.isSorted && column.isSortedDescending,
                onClick: () => this.sortByColumn(column, true)
            }
        ];
        return {
            items: items,
            target: ev.currentTarget,
            directionalHint: DirectionalHint.bottomLeftEdge,
            gapSpace: 10,
            isBeakVisible: false,
            onDismiss: this._onContextualMenuDismissed.bind(this)
        } as IContextualMenuProps;
    }

    private _onContextualMenuDismissed() {
        this.setState({
            columnContextualMenuProps: undefined
        });
    }

    /**
     * Specify result grouping for the list rendering
     * @param items
     * @param groupByFields
     */
    private _getGroups(items: any[], groupBy: IGrouping[], level: number = 0, startIndex: number = 0): IGroupsItems {
        // Group array which stores the configured grouping
        let groups: IGroup[] = [];
        let updatedItemsOrder: any[] = [];
        // Check if there are groupby fields set
        if (groupBy) {
            const group = groupBy[level];
            // Check if grouping is configured
            if (groupBy && groupBy.length > 0) {
                // Create grouped items object
                const groupedItems = {};
                items.forEach((item: any) => {
                    let groupName = item[group.name];
                    // Check if the group name exists
                    if (typeof groupName === "undefined") {
                        // Set the default empty label for the field
                        groupName = "";
                    }
                    // Check if group name is a number, this can cause sorting issues
                    if (typeof groupName === "number") {
                        groupName = `${groupName}.`;
                    }

                    // Check if current group already exists
                    if (typeof groupedItems[groupName] === "undefined") {
                        // Create a new group of items
                        groupedItems[groupName] = [];
                    }
                    groupedItems[groupName].push(item);
                });

                // Sort the grouped items object by its key
                const sortedGroups = {};
                let groupNames = Object.keys(groupedItems);
                groupNames = group.order === GroupOrder.ascending ? groupNames.sort() : groupNames.sort().reverse();
                groupNames.forEach((key: string) => {
                    sortedGroups[key] = groupedItems[key];
                });

                // Loop over all the groups
                for (const groupItems in sortedGroups) {
                    // Retrieve the total number of items per group
                    const totalItems = groupedItems[groupItems].length;
                    // Create the new group
                    const g: IGroup = {
                        name: groupItems === "undefined" ? "" : groupItems,
                        key: groupItems === "undefined" ? "" : groupItems,
                        startIndex: startIndex,
                        count: totalItems,
                    };
                    // Check if child grouping available
                    if (groupBy[level + 1]) {
                        // Get the child groups
                        const subGroup = this._getGroups(groupedItems[groupItems], groupBy, (level + 1), startIndex);
                        subGroup.items.forEach((item) => {
                            updatedItemsOrder.push(item);
                        });
                        g.children = subGroup.groups;
                    } else {
                        // Add the items to the updated items order array
                        groupedItems[groupItems].forEach((item) => {
                            updatedItemsOrder.push(item);
                        });
                    }
                    // Increase the start index for the next group
                    startIndex = startIndex + totalItems;
                    groups.push(g);
                }
            }
        }

        return {
            items: updatedItemsOrder,
            groups
        };
    }

    /**
     * Check if sorting needs to be set to the column
     * @param column
     */
    public sortByColumn = (column: IViewColumn, sortDescending: boolean): void => {
        const {sortColumn} = this.state;
        //if(sortColumn && sortColumn.key === column.key && sortColumn.isSortedDescending === sortDescending ) return;

        // Check if the field needs to be sorted
        if (has(column, 'sortable')) {
            // Check if the sorting option is true
            if (column.sortable) {
                // Update the columns
                let currColumn: IViewColumn;
                const sortedColumns = this.state.columns.map(c => {
                    if (c.key === column.key) {
                        c.isSortedDescending = sortDescending;
                        c.isSorted = true;
                        currColumn = c;
                    } else {
                        c.isSorted = false;
                        c.isSortedDescending = false;
                    }
                    return c;
                });

                // Check if selection needs to be updated
                if (this._selection) {
                    const selection = this._selection.getSelection();
                    if (selection && selection.length > 0) {
                        // Clear selection
                        this._selection.setItems([], true);
                    }
                }

                this.setState({
                    columns: sortedColumns,
                    sortColumn: currColumn
                }, () => this.onSortByColumn(currColumn));
            }
        }
    }

    protected onSortByColumn(column: IViewColumn) {
        const { items } = this.state;

        if (typeof this.props.onSort === "function") {
            this.props.onSort(column, items);
        }
        else {
            const ascItems = sortBy(items, [column.fieldName]);
            const sortedItems = column.isSortedDescending === true ? ascItems.reverse() : ascItems;

            this.set_items(sortedItems);
        }
    }

    public set_items(items: any[]) {
        this.setState({ items: items, flattenItems: this._flattenItems(items) });
    }

    /**
     * Default React component render method
     */
    public render(): React.ReactElement<IListViewProps> {
        let groupProps: IGroupRenderProps = {};
        const { items, flattenItems, columns, groups, columnContextualMenuProps } = this.state;

        // Check if selection mode is single selection,
        // if that is the case, disable the selection on grouping headers
        if (this.props.selectionMode === SelectionMode.single) {
            groupProps = {
                headerProps: {
                    onToggleSelectGroup: () => null,
                    onGroupHeaderClick: () => null,
                }
            };
        }

        return <>
            {this.renderList(flattenItems, columns, groupProps, groups, this._selection)}
            {columnContextualMenuProps && <ContextualMenu {...columnContextualMenuProps} />}
        </>;
    }

    protected renderList(items: any[], columns: IColumn[], groupProps: IGroupRenderProps, groups: IGroup[], selection: Selection): React.ReactElement {
        return React.createElement(DetailsList, {
            ...this.props,
            key: "ListView",
            items: items,
            columns: columns,
            groups: groups,
            selection: selection,
            layoutMode: DetailsListLayoutMode.justified,
            setKey: "ListView",
            groupProps: groupProps
        });
    }
}