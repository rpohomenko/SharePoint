import { IFormField, FilterType, IFilter, IFilterGroup } from "../../utilities/Entities";
import { IValidationResult } from "../form/fieldRenderer/IBaseFieldRendererProps";
import { BaseFieldRenderer } from "../form/fieldRenderer/BaseFieldRenderer";
import { IRegionalSettingsInfo, ITimeZoneInfo } from "@pnp/sp/regional-settings/types";
import { IList } from "@pnp/sp/lists";

export interface ISearchFieldProps {
    field: IFormField;
    list: IList;
    defaultValue?: any;
    filterType?: FilterType;
    disabled?: boolean;
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
    onChange: (filter: IFilter | IFilterGroup) => void;
    onValidate: (validationResult: IValidationResult) => void;
    onGetFieldRenderer?: (ref: React.Ref<any>, defaultRenderer: () => JSX.Element) => BaseFieldRenderer | JSX.Element;
}

export interface ISearchFieldState {
    filterType?: FilterType;
}