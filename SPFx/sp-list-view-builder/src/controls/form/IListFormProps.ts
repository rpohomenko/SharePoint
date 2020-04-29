import { FormMode, IFormField, IListItem } from '../../utilities/Entities';
import { IList } from '@pnp/sp/lists';

export interface IListFormProps {
    mode: FormMode;
    fields: IFormField[];
    itemPromise?: Promise<IListItem>;   
    onChange: (field: IFormField, value: any) => void;
}

export interface IListFormState {
    mode: FormMode;
    item?: IListItem;
    isLoading?: boolean;
}