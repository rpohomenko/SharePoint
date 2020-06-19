import { IFormField } from '../../../../utilities/Entities';
import { ITimeZoneInfo, IRegionalSettingsInfo } from '@pnp/sp/regional-settings/types';
import { IList } from '@pnp/sp/lists';

export interface IFormFieldEditorProps {
    list: IList;
    field?: IFormField;
    isOpen?: boolean;
    onChange: (field: IFormField) => void;
    regionalSettings?: Promise<IRegionalSettingsInfo>;
    timeZone?: Promise<ITimeZoneInfo>;
}

export interface IFormFieldEditorState {
    isOpen: boolean;
    field?: IFormField;
    changedField?: IFormField;
    isChanged?: boolean;
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
}
