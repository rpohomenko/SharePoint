import { IColumn } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { ITimeZoneInfo, IRegionalSettingsInfo } from "@pnp/sp/regional-settings/types";
import { IViewField, IFolder, IOrderByField, IListItem, IFormField, IEditableListItem, IFilterGroup } from '../../../../utilities/Entities';
import { IGrouping } from "../../../../controls/listView";
import { IList } from "@pnp/sp/lists";

export interface ISPListViewProps {
  list: IList;
  viewFields: IViewField[];
  formFields: IFormField[];
  count?: number;
  regionalSettings?: Promise<IRegionalSettingsInfo>;
  timeZone?: Promise<ITimeZoneInfo>;
  rootFolder?: IFolder;
  includeSubFolders?: boolean;
  showFolders?: boolean;
  orderBy?: IOrderByField[];
  groupBy?: IGrouping[];
  showCommandBar?: boolean;
}

export interface ISPListViewState {
  items?: IListItem[];
  selection?: IEditableListItem[];
  columns: IColumn[];
  isLoading?: boolean;
  folder?: IFolder;
  sortColumn?: IColumn;
  groupBy?: IGrouping[];
  canAddItem?: boolean; 
  isDeleting?: boolean;
  error?: string;
  showContextualMenu?: boolean;
  filter?: IFilterGroup; 
}
