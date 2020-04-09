import { PagedItemCollection } from "@pnp/sp/items";
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';

export interface ISPListViewProps {
  listId: string;
  viewFields: IViewField[];
  count?: number;
}

export interface ISPListViewState {
  page?: PagedItemCollection<any>;
  columns: IColumn[];
  isLoading?: boolean;
}

export interface IViewField {
  Id: string;
  Name: string;
  Title: string;
  DataType: DataType;
  OutputType?: DataType.Text | DataType.Number | DataType.Boolean | DataType.DateTime | DataType.Date;
  Sortable?: boolean;
  Filterable?: boolean;
}

export interface IViewLookupField extends IViewField {
  LookupFieldName: string;
  LookupListId: string;
  LookupWebId: string;
  //PrimaryFieldId?: string;
  PrimaryFieldName?: string;
}

export enum DataType {
  Text = 0,
  MultiLineText = 1,
  RichText = 2,
  DateTime = 3,
  Date = 4,
  Number = 5,
  Lookup = 6,
  MultiLookup = 7,
  Boolean = 8,
  Choice = 9,
  MultiChoice = 10,
  User = 11,
  MultiUser = 12
}

