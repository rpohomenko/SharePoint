import { IColumn, IGroup, IDetailsListProps } from 'office-ui-fabric-react/lib/components/DetailsList';

export enum GroupOrder {
    ascending = 0,
    descending = 1
}

export interface IViewColumn extends IColumn {
    sortable?: boolean;
    filterable?: boolean;
}

export interface IListViewProps extends IDetailsListProps {
    columns?: IViewColumn[];
    groupBy?: IGrouping[];
    onSelect?: (items: any[]) => void;
}

export interface IListViewState {
    items: any[];
    columns?: IColumn[];
    groups?: IGroup[];
}

export interface IGrouping {
    name: string;
    order: GroupOrder;
}

export interface IGroupsItems {
    items: any[];
    groups: IGroup[];
}