import { IPropertyPaneCustomFieldProps } from '@microsoft/sp-webpart-base';

import { IWeb } from "@pnp/sp/webs";
import { ListOrderBy, ISPListInfo } from '../../../controls/components/listPicker/IListPicker';

/**
 * Public properties of the PropertyFieldListPicker custom field
 */
export interface IPropertyFieldListPickerProps {
  /**
   * Property field label displayed on top
   */
  label: string;
  /**
   * Context of the current web part
   */
  web: IWeb;

  /**
   * Initial selected list set of the control
   */
  selectedList?: ISPListInfo | ISPListInfo[];
  /**
   * BaseTemplate ID of the lists or libaries you want to return.
   */
  baseTemplate?: number;
  /**
   * Specify if you want to include or exclude hidden lists. By default this is true.
   */
  includeHidden?: boolean;
  /**
   * Specify the property on which you want to order the retrieve set of lists.
   */
  orderBy?: ListOrderBy;
  /**
   * Specify if you want to have a single or mult list selector.
   */
  multiSelect?: boolean;
  /**
   * Defines a onPropertyChange function to raise when the selected value changed.
   * Normally this function must be always defined with the 'this.onPropertyChange'
   * method of the web part object.
   */
  onPropertyChange(propertyPath: string, newValue: any): void;
  /**
   * Parent Web Part properties
   */
  properties: any;
  /**
   * An UNIQUE key indicates the identity of this control
   */
  key?: string;
  /**
   * Whether the property pane field is enabled or not.
   */
  disabled?: boolean;
  /**
   * Filter list from Odata query (takes precendents over Hidden and BaseTemplate Filters)
   */
  filter?: string;
  /**
* Input placeholder text. Displayed until option is selected.
*/
  placeHolder?: string;
}

/**
 * Private properties of the PropertyFieldListPicker custom field.
 * We separate public & private properties to include onRender & onDispose method waited
 * by the PropertyFieldCustom, witout asking to the developer to add it when he's using
 * the PropertyFieldListPicker.
 *
 */
export interface IPropertyFieldListPickerPropsInternal extends IPropertyFieldListPickerProps, IPropertyPaneCustomFieldProps {
  /*label: string;

  web: IWeb;
  selectedList?: ISPListInfo | ISPListInfo[];
  baseTemplate?: number;
  orderBy?: ListOrderBy;
  includeHidden?: boolean;
  onPropertyChange(propertyPath: string, newValue: any): void;
  properties: any;  
  disabled?: boolean;
  deferredValidationTime?: number;
  filter?: string;   
  placeHolder?: string;*/
  key: string; 
  targetProperty: string;
}