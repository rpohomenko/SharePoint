import * as React from 'react';
import {  IColumn } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { IPropertyPaneCustomFieldProps } from "@microsoft/sp-property-pane";

export interface IPropertyPaneFieldListProps {
    label: string;   
    items?: any[];
    columns?: IColumn[];
    noItemsMessage?: React.ReactElement | string;
    onPropertyChange: (propertyPath: string, newValue: any) => void;
  }
  
  export interface IPropertyPaneFieldListInternalProps extends IPropertyPaneFieldListProps, IPropertyPaneCustomFieldProps {
    key: string; 
    targetProperty: string;
  }
  