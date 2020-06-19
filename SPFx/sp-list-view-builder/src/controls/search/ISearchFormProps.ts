import { IFormField, IFilterGroup, FilterJoin } from '../../utilities/Entities';
import { ITimeZoneInfo, IRegionalSettingsInfo } from '@pnp/sp/regional-settings';
import { IList } from '@pnp/sp/lists';

export interface ISearchFormProps {
    fields: IFormField[];
    list: IList;
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
    filterJoin?: FilterJoin;
    onChange: (filter: IFilterGroup) => void;
    filter?: IFilterGroup;
}

export interface ISearchFormState {

}