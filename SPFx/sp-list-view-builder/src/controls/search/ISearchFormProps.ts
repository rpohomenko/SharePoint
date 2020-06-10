import { IFormField, IFilterGroup } from '../../utilities/Entities';
import { ITimeZoneInfo, IRegionalSettingsInfo } from '@pnp/sp/regional-settings';

export interface ISearchFormProps {
    fields: IFormField[];
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;   
    onChange: (filter: IFilterGroup) => void;
}

export interface ISearchFormState {

}