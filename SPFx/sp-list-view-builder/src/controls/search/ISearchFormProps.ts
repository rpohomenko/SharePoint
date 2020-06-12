import { IFormField, IFilterGroup, FilterJoin } from '../../utilities/Entities';
import { ITimeZoneInfo, IRegionalSettingsInfo } from '@pnp/sp/regional-settings';

export interface ISearchFormProps {
    fields: IFormField[];
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
    filterJoin?: FilterJoin;
    onChange: (filter: IFilterGroup) => void;    
}

export interface ISearchFormState {

}