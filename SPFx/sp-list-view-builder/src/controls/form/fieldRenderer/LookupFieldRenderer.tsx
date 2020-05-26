import * as React from 'react';
import { Label } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { ListItemPicker } from '../../components/listItemPicker';
import { IList } from '@pnp/sp/lists';
import { ILookupFieldValue, FormMode, DataType } from '../../../utilities/Entities';
import { isEqual } from "@microsoft/sp-lodash-subset";
import DateHelper from '../../../utilities/DateHelper';
import moment from 'moment';
import { IRegionalSettingsInfo, ITimeZoneInfo } from '@pnp/sp/regional-settings/types';

export interface ILookupFieldRendererProps extends IBaseFieldRendererProps {
    list: IList;
    fieldName: string;
    itemLimit: number;
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
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
            this.setValue(defaultValue);
        }
    }

    public componentDidUpdate(prevProps: ILookupFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (!isEqual(prevProps.defaultValue, this.props.defaultValue)) {
            if (this.props.defaultValue instanceof Array) {
                this.setValue(this.props.defaultValue);
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
        const { defaultValue, dataType, fieldName } = this.props as ILookupFieldRendererProps;
        const lookupValues = defaultValue as ILookupFieldValue[];
        return lookupValues instanceof Array && lookupValues.length > 0
            ? <>{lookupValues.map((lookupValue, i) => <Label key={`${fieldName}_${i}`}>{this.formatFieldValue(lookupValue.Title, dataType)}</Label>)}</> : null;
    }

    private formatFieldValue(value: string, dataType: DataType): string {
        const { timeZone } = this.props as ILookupFieldRendererProps;
        
        if (value === undefined || value === null) {
            return "";
        }
        switch (dataType) {
            case DataType.Date:
            case DataType.DateTime:
                const dateValue = DateHelper.toLocalDate(new Date(value), timeZone ? timeZone.Information.Bias : 0);
                return dataType === DataType.Date ? moment(dateValue).format("L") : moment(dateValue).format("L LT");
            case DataType.Number:
                return Number(value).toString();
            case DataType.Boolean:
                return Boolean(value) === true ? "Yes" : "No";
        }
        return value;
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
            onChange={(lookupValues: ILookupFieldValue[]) => {
                this.setValue(lookupValues);
            }} />;
    }   

    public hasValue() {
        return this.state.value instanceof Array && this.state.value.length > 0;
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props as ILookupFieldRendererProps;
        if (mode === FormMode.New) {
            return this.hasValue();
        }
        else {
            let currentValue = this.getValue() as ILookupFieldValue[];
            let prevValue = defaultValue as ILookupFieldValue[];
            if (currentValue instanceof Array && prevValue instanceof Array) {
                if (currentValue.length !== prevValue.length) return true;
                currentValue = currentValue.sort((a, b) => a.Id - b.Id);
                prevValue = prevValue.sort((a, b) => a.Id - b.Id);
                for (let i = 0; i < currentValue.length; i++) {
                    if (currentValue[i].Id !== prevValue[i].Id) return true;
                }
                return false;
            }
            if (!currentValue) {
                return !!prevValue;
            }
            if (!prevValue) {
                return !!currentValue;
            }
            return false;
        }
    }
}