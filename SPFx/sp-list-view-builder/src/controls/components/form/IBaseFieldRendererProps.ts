import { DataType, FormMode } from '../../../utilities/Entities';

export interface IBaseFieldRendererProps {
    mode: FormMode;
    dataType: DataType;
    required?: boolean;
    title: string;
    onChange: (value: any) => void;
    onValidate: (validationResult: ValidationResult) => void;
    defaultValue?: any;
}

export interface IBaseFieldRendererState {
    mode: FormMode;
    value?: any;
    validationResult?: ValidationResult;
}

export interface ValidationResult {
    validationErrors: string[];
    isValid: boolean;
}