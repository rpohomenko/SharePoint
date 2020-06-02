import * as React from 'react';
import { DetailsList, ColumnActionsMode, DetailsListLayoutMode, Selection, SelectionMode, IColumn, IGroup, IGroupRenderProps, ShimmeredDetailsList, DirectionalHint, ContextualMenu, IContextualMenuProps } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
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
            //flattenItems: []
        };
        // Initialize the selection
        this._selection = new Selection({
            // Create the event handler when a selection changes
            onSelectionChanged: () => {
                if (this.props.onSelect instanceof Function) {
                    this.props.onSelect(this._selection.getSelection());
                }
            }
        });
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

        if (/*!isEqual(prevProps, this.props)*/ prevProps.items !== this.props.items || prevProps.columns !== this.props.columns) {
            // Reset the selected items
            if (this._selection) {
                this._selection.setItems(this.props.items, true);
            }
            this.updateState(this.props.items);
        }
    }

    /**
     * Default React component render method
     */
    public render(): React.ReactElement<IListViewProps> {
        let groupProps: IGroupRenderProps = {};
        const { items/*, flattenItems*/, columns, groups, columnContextualMenuProps } = this.state;

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
            {this.renderList(/*flattenItems*/ items, columns, groupProps, groups, this._selection)}
            {columnContextualMenuProps && <ContextualMenu {...columnContextualMenuProps} />}
        </>;
    }

    public deselect(){
        if (this._selection) {
            this._selection.setItems(this.props.items, true);
        }
    }

    protected renderList(items: any[], columns: IColumn[], groupProps: IGroupRenderProps, groups: IGroup[], selection: Selection): React.ReactElement {
        return React.createElement(ShimmeredDetailsList, {
            ...this.props,
            key: "ListView",
            items: items,
            columns: columns,
            groups: groups,
            selection: selection,
            layoutMode: DetailsListLayoutMode.justified,
            setKey: "ListView",
            groupProps: groupProps,
            onRenderDetailsFooter: this.renderDetailsFooter.bind(this)
        });
    }

    protected renderDetailsFooter(): JSX.Element {
        if ((!(this.props.items instanceof Array) || this.props.items.length === 0) && this.props.placeholder) {
            return this.props.placeholder;
        }
        return null;
    }

    protected updateState(items: any[]) {
        const { columns } = this.props;
        this.setState({
            //items: (typeof items !== 'undefined' && items !== null) ? [...items] : [],
            //flattenItems: (typeof items !== 'undefined' && items !== null) ? this._flattenItems(items) : [],
            columns: (typeof columns !== 'undefined' && columns !== null) ? this._createColumns(columns) : []
        });
        this._groupItems(items instanceof Array ? items : [], this.props.groupBy);
    }

    public set_items(items: any[], groups?: IGroup[]) {
        this.setState({ items: items/*, flattenItems: this._flattenItems(items)*/, groups: groups });
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
            const onColumnRender = column.onRender;
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
            },
            {
                key: `groupBy`,
                name: "Group By",
                iconProps: { iconName: 'GroupList' },
                canCheck: column.canGroup,
                disabled: !column.canGroup,
                checked: column.isGrouped,
                onClick: () => this.groupByColumn(column)
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
        const groups: IGroup[] = [];
        const updatedItemsOrder: any[] = [];
        // Check if there are groupby fields set
        if (groupBy) {
            const group = groupBy[level];
            // Check if grouping is configured
            if (groupBy && groupBy.length > 0) {
                // Create grouped items object
                const groupedItems = ListView.groupBy(items, item => {
                    if (group.keyGetter instanceof Function) {
                        return group.keyGetter(item) || "";
                    }
                    else {
                        return item[group.name] || "";
                    }
                });
                /*items.forEach((item: any) => {
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
                });*/

                // Sort the grouped items object by its key
                //const sortedGroups = {};
                let groupNames = Object.keys(groupedItems);

                if (this.state.sortColumn && group.name === this.state.sortColumn.fieldName) {
                    groupNames = this.state.sortColumn.isSortedDescending === true ? groupNames.sort().reverse() : groupNames.sort();
                }
                else {
                    groupNames = group.order === GroupOrder.ascending ? groupNames.sort() : groupNames.sort().reverse();
                }

                /*groupNames.forEach((key: string) => {
                    sortedGroups[key] = groupedItems[key];
                });*/

                // Loop over all the groups
                for (const groupKey of groupNames) {
                    // Retrieve the total number of items per group
                    const totalItems = groupedItems[groupKey].length;
                    // Create the new group
                    const g: IGroup = {
                        name: groupKey || "",
                        key: groupKey || "",
                        startIndex: startIndex,
                        count: totalItems,
                    };
                    // Check if child grouping available
                    if (groupBy[level + 1]) {
                        // Get the child groups
                        const subGroup = this._getGroups(groupedItems[groupKey], groupBy, (level + 1), startIndex);
                        subGroup.items.forEach((item) => {
                            updatedItemsOrder.push(item);
                        });
                        g.children = subGroup.groups;
                    } else {
                        // Add the items to the updated items order array
                        groupedItems[groupKey].forEach((item) => {
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

    private static groupBy<T extends any, K extends keyof T>(array: T[], key: K | { (obj: T): string | number }): Record<string | number, T[]> {
        const keyFn = key instanceof Function ? key : (obj: T) => obj[key];
        return array.reduce(
            (objectsByKeyValue, obj) => {
                const value = keyFn(obj);
                objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                return objectsByKeyValue;
            },
            {} as Record<string | number, T[]>
        );
    }

    public groupByColumn = (column: IViewColumn): void => {
        const { columns } = this.state;
        if (has(column, 'canGroup') && column.canGroup) {
            // Update the columns
            let currColumn: IViewColumn;
            const groupedColumns = columns.map(c => {
                if (c.key === column.key) {
                    c.isGrouped = !column.isGrouped;
                    currColumn = c;
                }
                else {
                    c.isGrouped = false;
                    //c.isSorted = false;
                    //c.isSortedDescending = false;
                }
                return c;
            });

            this.setState({
                columns: groupedColumns,
                //groups: undefined
            }, () => this.onGroupByColumn(/*currColumn*/...groupedColumns/*.filter(c => c.isGrouped)*/));
        }
    }

    protected onGroupByColumn(...columns: IViewColumn[]) {
        const { items } = this.state;
        const groupBy = columns.filter(c => c.isGrouped).map(c => {
            return { name: c.fieldName, order: c.isSortedDescending ? GroupOrder.descending : GroupOrder.ascending } as IGrouping;
        });

        if (this.props.onGroup instanceof Function) {
            this.props.onGroup(groupBy, columns, items, (sortedItems: any[], newGroupBy: IGrouping[], groups?: IGroup[]) => {
                if (!(groups instanceof Array)) {
                    this._groupItems(sortedItems, newGroupBy || groupBy);
                }
                else {
                    this.set_items(sortedItems, groups);
                }
            });
        }
        else {
            this._groupItems(items, groupBy);
        }
    }

    /**
     * Check if sorting needs to be set to the column
     * @param column
     */
    public sortByColumn = (column: IViewColumn, sortDescending: boolean): void => {
        const { sortColumn, columns, groups } = this.state;
        if (sortColumn && column.fieldName === sortColumn.fieldName && column.isSorted === sortColumn.isSorted && sortDescending === sortColumn.isSortedDescending) {
            sortColumn.isSorted = false;
            sortColumn.isSortedDescending = false;
            this.setState({
                sortColumn: undefined, columns: columns
            }, () => this.onSortByColumn(null));
            return;
        }
        //if(sortColumn && sortColumn.key === column.key && sortColumn.isSortedDescending === sortDescending ) return;

        // Check if the field needs to be sorted
        if (has(column, 'sortable')) {
            // Check if the sorting option is true
            if (column.sortable) {
                // Update the columns
                let currColumn: IViewColumn;
                const sortedColumns = columns.map(c => {
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

        if (this.props.onSort instanceof Function) {
            this.props.onSort(column, items, (sortedItems: any[], groupBy: IGrouping[], groups?: IGroup[]) => {
                if (!(groups instanceof Array)) {
                    this._groupItems(sortedItems, groupBy || this.props.groupBy);
                }
                else {
                    this.set_items(sortedItems, groups);
                }
            });
        }
        else {
            const ascItems = sortBy(items, [column.fieldName]);
            const sortedItems = column.isSortedDescending === true ? ascItems.reverse() : ascItems;
            this._groupItems(sortedItems, this.props.groupBy);
        }
    }

    private _groupItems(items: any[], groupBy: IGrouping[]) {
        if (groupBy instanceof Array && groupBy.length > 0) {
            const groupedItems = this._getGroups(items, groupBy);
            this.set_items(groupedItems.groups.length > 0 ? groupedItems.items : items, groupedItems.groups);
        }
        else {
            this.set_items(items, undefined);
        }
    }
}