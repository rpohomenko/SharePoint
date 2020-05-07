import { FormMode, IFormField } from '../../utilities/Entities';
import { BaseFieldRenderer } from './fieldRenderer/BaseFieldRenderer';
import { IBaseFieldRendererProps, IValidationResult } from './fieldRenderer/IBaseFieldRendererProps';
import { IRegionalSettingsInfo, ITimeZoneInfo } from '@pnp/sp/regional-settings';

export interface IFormFieldProps {
    mode: FormMode;
    field: IFormField;
    defaultValue?: any;
    disabled?: boolean;
    onChange: (value: any, isDirty: boolean) => void;
    onValidate: (validationResult: IValidationResult) => void;
    onGetFieldRenderer?: (ref: React.Ref<any>, defaultRenderer: () => JSX.Element) => BaseFieldRenderer | JSX.Element;
}

export interface ITextFormFieldProps extends IFormFieldProps {  
    maxLength?: number;
}

export interface ILookupFormFieldProps extends IFormFieldProps {

}

export interface IUserFormFieldProps extends IFormFieldProps {
   limit?: number;
   suggestionsLimit?: number;
}

export interface IDateFormFieldProps extends IFormFieldProps {
    firstDayOfWeek?: number;
    shortDateFormat?: string;
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
}

export interface IFormFieldState {
    mode: FormMode;
    isCalloutVisible?: boolean;
}