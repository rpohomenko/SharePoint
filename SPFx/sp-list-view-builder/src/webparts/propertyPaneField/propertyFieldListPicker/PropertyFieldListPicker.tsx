import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
    IPropertyPaneField,
    PropertyPaneFieldType
} from '@microsoft/sp-webpart-base';

import { IWeb } from "@pnp/sp/webs";
import { ListPicker, ListOrderBy, IListPickerProps, ISPListInfo } from '../../../controls/components/listPicker';

import { IPropertyFieldListPickerProps, IPropertyFieldListPickerPropsInternal } from './IPropertyFieldListPicker';

/**
 * Represents a PropertyFieldListPicker object
 */
class PropertyFieldListPickerBuilder implements IPropertyPaneField<IPropertyFieldListPickerPropsInternal> {

    //Properties defined by IPropertyPaneField
    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public properties: IPropertyFieldListPickerPropsInternal;

    //Custom properties label: string;
    private label: string;
    private web: IWeb;
    private selectedList: ISPListInfo | ISPListInfo[];
    private baseTemplate: number;
    private orderBy: ListOrderBy;
    private multiSelect: boolean;
    private includeHidden: boolean;

    public onPropertyChange(propertyPath: string, newValue: any): void { }
    private customProperties: any;
    private key: string;
    private disabled: boolean = false;
    private placeHolder?: string;   
    private filter: string;

    /**
     * Constructor method
     */
    public constructor(_targetProperty: string, _properties: IPropertyFieldListPickerPropsInternal) {
        this.render = this.render.bind(this);
        this.targetProperty = _targetProperty;
        this.properties = _properties;
        this.properties.onDispose = this.dispose;
        this.properties.onRender = this.render;
        this.label = _properties.label;
        this.web = _properties.web;
        this.selectedList = _properties.selectedList;
        this.baseTemplate = _properties.baseTemplate;
        this.orderBy = _properties.orderBy;
        this.multiSelect = _properties.multiSelect;
        this.includeHidden = _properties.includeHidden;
        this.onPropertyChange = _properties.onPropertyChange;
        this.customProperties = _properties.properties;
        this.key = _properties.key;
        this.placeHolder = _properties.placeHolder;
        this.filter = _properties.filter;

        if (_properties.disabled === true) {
            this.disabled = _properties.disabled;
        }        
    }

    /**
     * Renders the SPListPicker field content
     */
    private render(elem: HTMLElement, ctx?: any, changeCallback?: (targetProperty?: string, newValue?: any) => void): void {
        const componentProps = {
            label: this.label,
            targetProperty: this.targetProperty,
            web: this.web,
            baseTemplate: this.baseTemplate,
            orderBy: this.orderBy,
            multiSelect: this.multiSelect,
            includeHidden: this.includeHidden,
            onDispose: this.dispose,
            onRender: this.render,
            onSelectionChanged: (newValue) => {
                if (this.onPropertyChange instanceof Function) {
                    this.onPropertyChange(this.targetProperty, newValue);
                }
                if (changeCallback instanceof Function) {
                    changeCallback(this.targetProperty, newValue);
                }
            },
            properties: this.customProperties,
            key: this.key,
            disabled: this.disabled,
            placeHolder: this.placeHolder,          
            filter: this.filter,
            selectedList: this.selectedList
        } as IListPickerProps;

        const element: React.ReactElement<IListPickerProps> = React.createElement(ListPicker, componentProps);
        // Calls the REACT content generator
        ReactDom.render(element, elem);
    }

    /**
     * Disposes the current object
     */
    private dispose(elem: HTMLElement): void {

    }
}

/**
 * Helper method to create a SPList Picker on the PropertyPane.
 * @param targetProperty - Target property the SharePoint list picker is associated to.
 * @param properties - Strongly typed SPList Picker properties.
 */
export function PropertyFieldListPicker(targetProperty: string, properties: IPropertyFieldListPickerProps): IPropertyPaneField<IPropertyFieldListPickerPropsInternal> {

    //Create an internal properties object from the given properties
    const newProperties: IPropertyFieldListPickerPropsInternal = {
        label: properties.label,
        targetProperty: targetProperty,
        web: properties.web,
        selectedList: properties.selectedList,
        baseTemplate: properties.baseTemplate,
        orderBy: properties.orderBy,
        multiSelect: properties.multiSelect || false,
        includeHidden: properties.includeHidden,
        onPropertyChange: properties.onPropertyChange,
        properties: properties.properties,
        onDispose: null,
        onRender: null,
        key: properties.key,
        disabled: properties.disabled,
        placeHolder: properties.placeHolder,      
        filter: properties.filter
    };
    //Calls the PropertyFieldListPicker builder object
    //This object will simulate a PropertyFieldCustom to manage his rendering process
    return new PropertyFieldListPickerBuilder(targetProperty, newProperties);
}