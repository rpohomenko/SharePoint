import { IColumn, IGroup, IDetailsListProps, IContextualMenuProps } from 'office-ui-fabric-react' /* '@fluentui/react'*/;

export interface IViewColumn extends IColumn {
    sortable?: boolean;
    filterable?: boolean;
    canGroup?: boolean;
}

export interface IListViewProps extends IDetailsListProps {
    items: any[];
    columns?: IViewColumn[];
    groupBy?: IGrouping[];
    placeholder?: JSX.Element;
    onSelect?: (items: any[]) => void;
    onSort?: (sortColumn: IViewColumn, items: any[], onSort: (sortedItems: any[], groupBy?: IGrouping[], groups? : IGroup[]) => void) => void;
    onGroup?: (groupBy: IGrouping[], columns: IViewColumn[], items: any[], onGroup: (groupedItems: any[], groupBy?: IGrouping[], groups? : IGroup[]) => void) => void;
}

export interface IListViewState {
    items: any[];
    //flattenItems: any[];
    columns?: IColumn[];
    sortColumn?: IViewColumn;
    groups?: IGroup[];
    columnContextualMenuProps?: IContextualMenuProps;    
}

export enum GroupOrder {
    ascending = 0,
    descending = 1
}

export interface IGrouping {
    name: string;
    order: GroupOrder;
    keyGetter?: (item: any) => string;
}