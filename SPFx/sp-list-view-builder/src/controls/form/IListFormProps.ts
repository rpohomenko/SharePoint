import { FormMode, IFormField, IListItem } from '../../utilities/Entities';
import { IList } from '@pnp/sp/lists';
import { ITimeZoneInfo, IRegionalSettingsInfo } from '@pnp/sp/regional-settings';

export interface IListFormProps {
    mode: FormMode;
    list: IList;
    itemId?: number;
    fields: IFormField[];
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
    onItemLoaded: (item: IListItem) => void;
    onChange: (field: IFormField, value: any, isDirty: boolean) => void; 
}

export interface IListFormState {
    mode: FormMode;
    item?: IListItem;
    isLoading?: boolean;
    isSaving?: boolean;
    error?: string;
}