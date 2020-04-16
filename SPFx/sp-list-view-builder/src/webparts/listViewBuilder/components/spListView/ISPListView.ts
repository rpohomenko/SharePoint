import { PagedItemCollection } from "@pnp/sp/items";
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { ITimeZoneInfo, IRegionalSettingsInfo } from "@pnp/sp/regional-settings/types";
import { IViewField, IFolder, IOrderByField } from '../../../../utilities/Entities';

export interface ISPListViewProps {
  listId: string;
  viewFields: IViewField[];
  count?: number;
  regionalSettings?: Promise<IRegionalSettingsInfo>;
  timeZone?: Promise<ITimeZoneInfo>;
  rootFolder?: IFolder;
  includeSubFolders?: boolean;
  showFolders?: boolean;
  orderBy?: IOrderByField[];
}

export interface ISPListViewState {
  page?: PagedItemCollection<any>;
  columns: IColumn[];
  isLoading?: boolean;
  folder?: IFolder;
  sortColumn?: IColumn;
}
