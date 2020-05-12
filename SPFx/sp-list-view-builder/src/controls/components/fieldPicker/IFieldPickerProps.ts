import { IList } from "@pnp/sp/lists";
import { IField } from "../../../utilities/Entities";
import { IFieldInfo } from "@pnp/sp/fields";

export interface IFieldPickerProps {
    label?: string;
    list: IList;
    disabled?: boolean;
    placeholder?: string;
    selected?: IField[];
    itemLimit?: number;
    onChange?: (fields: IFieldInfo[]) => void;
    onFilter?: (field: IFieldInfo) => boolean;
}

export interface IFieldPickerState {

}