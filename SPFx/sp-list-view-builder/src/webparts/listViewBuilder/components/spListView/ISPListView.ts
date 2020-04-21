import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { ITimeZoneInfo, IRegionalSettingsInfo } from "@pnp/sp/regional-settings/types";
import { IViewField, IFolder, IOrderByField, IListItem } from '../../../../utilities/Entities';
import { IGrouping } from "../../../../controls/listView";
import { IList } from "@pnp/sp/lists";

export interface ISPListViewProps {
  list: IList;
  viewFields: IViewField[];
  count?: number;
  regionalSettings?: Promise<IRegionalSettingsInfo>;
  timeZone?: Promise<ITimeZoneInfo>;
  rootFolder?: IFolder;
  includeSubFolders?: boolean;
  showFolders?: boolean;
  orderBy?: IOrderByField[];
  groupBy?: IGrouping[]; 
}

export interface ISPListViewState {
  //page?: PagedItemCollection<IListItem[]>;
  items?: IListItem[];
  selection?: IListItem[];
  columns: IColumn[];
  isLoading?: boolean;
  folder?: IFolder;
  sortColumn?: IColumn;
  groupBy?: IGrouping[];
  canAddItems?: boolean; 
  isDeleting?: boolean;
}
