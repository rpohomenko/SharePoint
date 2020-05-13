import * as React from 'react';
import { Label } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { ListItemPicker, IListItemPickerProps } from '../../components/listItemPicker';
import { IList } from '@pnp/sp/lists';
import { ILookupFieldValue, IListItem, FormMode } from '../../../utilities/Entities';
import { isEqual } from "@microsoft/sp-lodash-subset";

export interface ILookupFieldRendererProps extends IBaseFieldRendererProps {
    list: IList;
    fieldName: string;
    itemLimit: number;    
}

export class LookupFieldRenderer extends BaseFieldRenderer {

    private _lookupField: React.RefObject<ListItemPicker>;

    constructor(props: ILookupFieldRendererProps) {
        super(props);
        this._lookupField = React.createRef();
    }


    public componentDidMount() {
        const { defaultValue } = this.props as ILookupFieldRendererProps;
        if (defaultValue instanceof Array) {
            this.setValue((defaultValue as IListItem[]).map(v => { return { ID: v.ID, Title: v[(this.props as ILookupFieldRendererProps).fieldName || 'Title'] } as IListItem; }));
        }
    }

    public componentDidUpdate(prevProps: ILookupFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (!isEqual(prevProps.defaultValue, this.props.defaultValue)) {
            if (this.props.defaultValue instanceof Array) {
                this.setValue((this.props.defaultValue as IListItem[]).map(v => { return { ID: v.ID, Title: v[(this.props as ILookupFieldRendererProps).fieldName || 'Title'] } as IListItem; }));
            }
            else {
                this.setValue(null);
            }
        }
    }

    protected onRenderNewForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderEditForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderDispForm() {
        const { defaultValue } = this.props as ILookupFieldRendererProps;
        return defaultValue ? <Label>{(defaultValue as ILookupFieldValue).Title}</Label> : null;
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled, list, fieldName, itemLimit } = this.props as ILookupFieldRendererProps;
        const { value } = this.state;
        return <ListItemPicker
            ref={this._lookupField}
            list={list}
            fieldName={fieldName}
            disabled={disabled}
            selected={value}
            itemLimit={itemLimit || 5}
            placeholder={"Search..."}
            onChange={(items: IListItem[]) => {
                this.setValue(items);
            }} />;
    }

    public getValue() {
        if (this.state.value instanceof Array && this.state.value.length > 0) {
            return (this.state.value as IListItem[]).map(v => { return { Id: v.ID, Title: v.Title } as ILookupFieldValue; });
        }
        return null;
    }

    public hasValue() {
        return this.state.value instanceof Array && this.state.value.length > 0;
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        if (mode === FormMode.New) {
            return this.hasValue();
        }
        else {
            const value = this.getValue();
            if (value instanceof Array && defaultValue instanceof Array) {
                if (value.length !== defaultValue.length) return true;
                const arr1 = value.sort((a, b) => a.Id - b.Id) as ILookupFieldValue[];
                const arr2 = defaultValue.sort((a, b) => a.Id - b.Id) as ILookupFieldValue[];
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i].Id !== arr2[i].Id) return true;                   
                }
                return false;
            }
            if (!value) {
                return !!defaultValue;
            }
            if (!defaultValue) {
                return !!value;
            }
            return false;
        }
    }
}