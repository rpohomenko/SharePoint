import * as React from 'react';
import { Toggle, IToggle, Label } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { isEqual } from '@microsoft/sp-lodash-subset';
import { FormMode } from '../../../utilities/Entities';

export interface IBooleanFieldRendererProps extends IBaseFieldRendererProps {

}

export class BooleanFieldRenderer extends BaseFieldRenderer {

    private _booleanField: React.RefObject<IToggle>;

    constructor(props: IBooleanFieldRendererProps) {
        super(props);
        this._booleanField = React.createRef();
    }

    public componentDidMount() {
        this.setValue(this.parseValue(this.props.defaultValue));
    }

    private parseValue(value: any): boolean {
        if (typeof this.props.defaultValue === "boolean") {
            return this.props.defaultValue;
        }
        else if (this.props.defaultValue === "0" || this.props.defaultValue === "false" || this.props.defaultValue === "FALSE") {
            return false;
        }
        else if (this.props.defaultValue === "1" || this.props.defaultValue === "true" || this.props.defaultValue === "TRUE") {
            return true;
        }
        return null;
    }

    public componentDidUpdate(prevProps: IBooleanFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (!isEqual(prevProps.defaultValue, this.props.defaultValue)) {
            this.componentDidMount();
        }
    }

    protected onRenderNewForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderEditForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderDispForm() {
        if (typeof this.props.defaultValue === "boolean") {
            return <Label>{this.props.defaultValue === true ? "Yes" : "No"}</Label>;
        }
        else if (this.props.defaultValue === "0" || this.props.defaultValue === "false" || this.props.defaultValue === "FALSE") {
            return <Label>{"No"}</Label>;
        }
        else if (this.props.defaultValue === "1" || this.props.defaultValue === "true" || this.props.defaultValue === "TRUE") {
            return <Label>{"Yes"}</Label>;
        }
        return null;
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled } = this.props as IBooleanFieldRendererProps;
        const { value } = this.state;
        return <Toggle
            componentRef={this._booleanField}
            disabled={disabled}
            onText="Yes"
            offText="No"
            checked={value === true}
            onChange={(ev, checked?: boolean) => {
                this.setValue(checked);
            }} />;
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        const prevValue = this.parseValue(defaultValue);        
        return mode === FormMode.New ? this.hasValue() : !isEqual(this.getValue(), prevValue);
    }

    public setValue(newValue: any) {
        super.setValue(newValue);
    }
}