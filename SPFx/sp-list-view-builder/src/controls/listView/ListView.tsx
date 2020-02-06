import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, Selection, SelectionMode, IGroup } from 'office-ui-fabric-react/lib/DetailsList';
import { IListViewProps, IListViewState, IViewColumn, IGroupsItems, IGrouping, GroupOrder } from './IListView';
import { IGroupRenderProps } from 'office-ui-fabric-react/lib/components/DetailsList';
import { findIndex, has, isEqual } from '@microsoft/sp-lodash-subset';

export class ListView extends React.Component<IListViewProps, IListViewState> {
    private _selection: Selection;

    constructor(props: IListViewProps) {
        super(props);

        // Initialize state
        this.state = {
            items: []
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
        }
    }

    /**
     * Specify result grouping for the list rendering
     * @param items
     * @param groupByFields
     */
    private _getGroups(items: any[], groupByFields: IGrouping[], level: number = 0, startIndex: number = 0): IGroupsItems {
        // Group array which stores the configured grouping
        let groups: IGroup[] = [];
        let updatedItemsOrder: any[] = [];
        // Check if there are groupby fields set
        if (groupByFields) {
            const groupField = groupByFields[level];
            // Check if grouping is configured
            if (groupByFields && groupByFields.length > 0) {
                // Create grouped items object
                const groupedItems = {};
                items.forEach((item: any) => {
                    let groupName = item[groupField.name];
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
                groupNames = groupField.order === GroupOrder.ascending ? groupNames.sort() : groupNames.sort().reverse();
                groupNames.forEach((key: string) => {
                    sortedGroups[key] = groupedItems[key];
                });

                // Loop over all the groups
                for (const groupItems in sortedGroups) {
                    // Retrieve the total number of items per group
                    const totalItems = groupedItems[groupItems].length;
                    // Create the new group
                    const group: IGroup = {
                        name: groupItems === "undefined" ? "" : groupItems,
                        key: groupItems === "undefined" ? "" : groupItems,
                        startIndex: startIndex,
                        count: totalItems,
                    };
                    // Check if child grouping available
                    if (groupByFields[level + 1]) {
                        // Get the child groups
                        const subGroup = this._getGroups(groupedItems[groupItems], groupByFields, (level + 1), startIndex);
                        subGroup.items.forEach((item) => {
                            updatedItemsOrder.push(item);
                        });
                        group.children = subGroup.groups;
                    } else {
                        // Add the items to the updated items order array
                        groupedItems[groupItems].forEach((item) => {
                            updatedItemsOrder.push(item);
                        });
                    }
                    // Increase the start index for the next group
                    startIndex = startIndex + totalItems;
                    groups.push(group);
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
    public sortByColumn = (column: IViewColumn): void => {
        // Find the field in the viewFields list
        const columnIdx = findIndex(this.props.columns, c => c.name === column.key);
        // Check if the field has been found
        if (columnIdx !== -1) {
            const column = this.props.columns[columnIdx];
            // Check if the field needs to be sorted
            if (has(column, 'sortable')) {
                // Check if the sorting option is true
                if (column.sortable) {
                    const sortDescending = typeof column.isSortedDescending === 'undefined' ? false : !column.isSortedDescending;
                    // Update the columns
                    const sortedColumns = this.state.columns.map(c => {
                        if (c.key === column.key) {
                            c.isSortedDescending = sortDescending;
                            c.isSorted = true;
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
                    }, () => this.onSortByColumn(column, sortDescending));
                }
            }
        }
    }

    protected onSortByColumn(column: IViewColumn, descending = false) {

    }

    /**
     * Default React component render method
     */
    public render(): React.ReactElement<IListViewProps> {
        let groupProps: IGroupRenderProps = {};

        const { items, columns, groups } = this.state;

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

        return React.createElement(DetailsList, {
            ...this.props,
            key: "ListView",
            items: items,
            columns: columns,
            groups: groups,
            selection: this._selection,
            layoutMode: DetailsListLayoutMode.justified,
            setKey: "ListView",
            groupProps: groupProps
        });
    }
}