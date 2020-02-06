import { IDropdownOption } from 'office-ui-fabric-react/lib/components/Dropdown';

export interface IConfiguration {
  ListId: string;
  ViewFields: IViewField[]

 //TODO: properties
}

export interface IViewField{
   Name: string;
   Title: string;
   DataType: DataType;
   Sortable?: boolean;
   Filterable?: boolean;
}

export interface IViewLookupField extends IViewField{  
  LookupFieldName: string;
  LookupListId: string;
  LookupWebId: string; 
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

export interface IConfigurationOption extends IDropdownOption {
  itemId: number;
  data: string | IConfiguration;
}