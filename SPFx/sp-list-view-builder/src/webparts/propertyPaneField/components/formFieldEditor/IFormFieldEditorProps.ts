import { IFormField } from '../../../../utilities/Entities';

export interface IFormFieldEditorProps {
    field?: IFormField;
    isOpen?: boolean;
    onChange: (field: IFormField) => void;
}

export interface IFormFieldEditorState {
    isOpen: boolean;
    field?: IFormField;
    changedField?: IFormField;
    isChanged?: boolean;
}
