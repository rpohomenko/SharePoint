
import { IPropertyPaneCustomFieldProps } from "@microsoft/sp-property-pane";
import { IList } from "@pnp/sp/lists";
import { IField } from '../../../utilities/Entities';

export interface IPropertyPaneFieldPickerProps {
  label: string;
  onPropertyChange: (propertyPath: string, newValue: any) => void;
  list: IList;
  placeholder?: string;
  itemLimit?: number;
  selected?: IField[];
  disabled?: boolean;
}

export interface IPropertyPaneFieldPickerInternalProps extends IPropertyPaneFieldPickerProps, IPropertyPaneCustomFieldProps {
  key: string;
  targetProperty: string;
}
