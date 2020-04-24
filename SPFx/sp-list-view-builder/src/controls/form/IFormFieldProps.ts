import { FormMode, IFormField } from '../../utilities/Entities';
import { BaseFieldRenderer } from './fieldRenderer/BaseFieldRenderer';
import { IBaseFieldRendererProps, ValidationResult } from './fieldRenderer/IBaseFieldRendererProps';

export interface IFormFieldProps {
    mode: FormMode;
    field: IFormField;
    defaultValue?: any;   
    onChange: (value: any) => void;
    onValidate: (validationResult: ValidationResult) => void;
    onGetFieldRenderer?: (ref: React.Ref<any>, defaultRenderer: () => JSX.Element) => BaseFieldRenderer | JSX.Element;
}

export interface IFormFieldState {
    mode: FormMode;
    isCalloutVisible?: boolean;
}