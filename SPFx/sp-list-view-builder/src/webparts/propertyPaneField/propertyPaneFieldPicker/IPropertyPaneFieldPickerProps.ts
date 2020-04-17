
import { IPropertyPaneCustomFieldProps } from "@microsoft/sp-property-pane";
import { IList } from "@pnp/sp/lists";
import { IField } from '../../../utilities/Entities';
import { IFieldInfo } from "@pnp/sp/fields";

export interface IPropertyPaneFieldPickerProps {
  label: string;
  onPropertyChange: (propertyPath: string, newValue: any) => void;
  list: IList;
  placeholder?: string;
  itemLimit?: number;
  selected?: IField[];
  disabled?: boolean;
  onFilter?: (field: IFieldInfo) => boolean;
}

export interface IPropertyPaneFieldPickerInternalProps extends IPropertyPaneFieldPickerProps, IPropertyPaneCustomFieldProps {
  key: string;
  targetProperty: string;
}
