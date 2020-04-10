import { IViewField } from '../../../webparts/listViewBuilder/components/spListView/ISPListView';

export interface IEditViewFieldProps {
    field?: IViewField;
    isOpen?: boolean;
    onChange: (field: IViewField) => void;
}

export interface IEditViewFieldState {
    isOpen: boolean;
    field?: IViewField;
    changedField?: IViewField;
    isChanged?: boolean;
}