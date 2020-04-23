import { IViewField } from '../../../../utilities/Entities';

export interface IViewFieldEditorProps {
    field?: IViewField;
    isOpen?: boolean;
    onChange: (field: IViewField) => void;
}

export interface IViewFieldEditorState {
    isOpen: boolean;
    field?: IViewField;
    changedField?: IViewField;
    isChanged?: boolean;
}
