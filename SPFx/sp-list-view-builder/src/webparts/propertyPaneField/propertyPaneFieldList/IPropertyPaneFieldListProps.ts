import * as React from 'react';
import {  IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { IPropertyPaneCustomFieldProps } from "@microsoft/sp-property-pane";

export interface IPropertyPaneFieldListProps {
    label: string;
    onPropertyChange: (propertyPath: string, newValue: any) => void;
    items: any[];
    columns: IColumn[];
    noItemsMessage: React.ReactElement | string;
  }
  
  export interface IPropertyPaneFieldListInternalProps extends IPropertyPaneFieldListProps, IPropertyPaneCustomFieldProps {
    key: string; 
    targetProperty: string;
  }
  