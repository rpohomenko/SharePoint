import { IList } from "@pnp/sp/lists";
import { IField } from "../../../utilities/Entities";

export interface IFieldPickerProps {
    label?: string;
    list: IList;
    disabled?: boolean;
    placeholder?: string;
    selected?: IField[];
    itemLimit?: number;
    onChange: (fields: IField[]) => void;   
}

export interface IFieldPickerState {

}