import { IDropdownOption } from 'office-ui-fabric-react/lib/components/Dropdown';
import { IPropertyPaneCustomFieldProps } from "@microsoft/sp-property-pane";
import { Guid } from '@microsoft/sp-core-library';

export interface IConfiguration {

  ListId: Guid;
  ViewFields: Array<IViewField>

 //TODO: properties
}

export interface IViewField{
   Name: string;
   Title: string;   
}

export interface IConfigurationOption extends IDropdownOption {
  itemId: number;
  data: string | IConfiguration;
}