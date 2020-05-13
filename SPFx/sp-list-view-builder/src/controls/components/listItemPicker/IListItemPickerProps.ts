import { IList } from "@pnp/sp/lists";
import { IField, IListItem } from "../../../utilities/Entities";

export interface IListItemPickerProps {
    label?: string;
    list: IList;
    disabled?: boolean;
    placeholder?: string;
    selected?: IListItem[];
    itemLimit?: number;
    fieldName?: string;
    minCharacters?: number;
    onChange?: (items: IListItem[]) => void;
    onFilter?: (item: IListItem) => boolean;
}

export interface IListItemPickerState {

}