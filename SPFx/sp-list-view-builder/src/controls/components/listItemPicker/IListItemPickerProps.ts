import { IList } from "@pnp/sp/lists";
import { IListItem, ILookupFieldValue } from "../../../utilities/Entities";

export interface IListItemPickerProps {
    label?: string;
    list: IList;
    disabled?: boolean;
    placeholder?: string;
    selected?: ILookupFieldValue[];
    suggestionsLimit?: number;
    resolveDelay?: number;
    selectionLimit?: number;
    fieldName?: string;
    minCharacters?: number;
    onChange?: (lookupValues: ILookupFieldValue[]) => void;
    onFilter?: (item: IListItem) => boolean;
}

export interface IListItemPickerState {

}