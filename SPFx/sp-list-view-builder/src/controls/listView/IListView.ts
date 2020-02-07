import { IColumn, IGroup, IDetailsListProps } from 'office-ui-fabric-react/lib/components/DetailsList';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';

export enum GroupOrder {
    ascending = 0,
    descending = 1
}

export interface IViewColumn extends IColumn {
    sortable?: boolean;
    filterable?: boolean;
}

export interface IListViewProps extends IDetailsListProps {
    items: any[];
    columns?: IViewColumn[];
    groupBy?: IGrouping[];
    onSelect?: (items: any[]) => void;
    onSort?: (sortColumn: IViewColumn, items: any[]) => void;
}

export interface IListViewState {
    items: any[];
    flattenItems: any[];
    columns?: IColumn[];
    sortColumn?: IViewColumn;
    groups?: IGroup[];
    columnContextualMenuProps?: IContextualMenuProps;
}

export interface IGrouping {
    name: string;
    order: GroupOrder;
}