import { IDropdownOption } from 'office-ui-fabric-react/lib/components/Dropdown';
import { IViewField } from './components/spListView/ISPListView';

export interface IConfiguration {
  ListId: string;
  ViewFields: IViewField[];

 //TODO: properties
}

export interface IConfigurationOption extends IDropdownOption {
  itemId: number;
  data: string | IConfiguration;
}