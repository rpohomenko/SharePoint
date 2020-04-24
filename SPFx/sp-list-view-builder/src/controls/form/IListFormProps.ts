import { FormMode, IFormField } from '../../utilities/Entities';

export interface IListFormProps {
    mode: FormMode;
    fields: IFormField[];
    itemId?: number;
    onChange: (field: IFormField, value: any) => void;
}

export interface IListFormState {
    mode: FormMode;
}