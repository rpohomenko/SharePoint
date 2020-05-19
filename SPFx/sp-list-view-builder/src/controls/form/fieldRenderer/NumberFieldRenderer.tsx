import * as React from 'react';
import { Label, TextField, ITextField } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState, IValidationResult } from './IBaseFieldRendererProps';
import { FormMode } from '../../../utilities/Entities';
import { isEqual } from '@microsoft/sp-lodash-subset';

export interface INumberFieldRendererProps extends IBaseFieldRendererProps {
    min?: number;
    max?: number;
    integerOnly?: boolean;
}

export class NumberFieldRenderer extends BaseFieldRenderer {

    private _numberField: React.RefObject<ITextField>;

    constructor(props: INumberFieldRendererProps) {
        super(props);
        this._numberField = React.createRef();
    }

    public componentDidMount() {
        const value = Number(this.props.defaultValue);
        if (!isNaN(value)) {
            this.setValue(this.props.defaultValue);
        }
        else {
            this.setValue("");
        }
    }

    public componentDidUpdate(prevProps: INumberFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (!isEqual(prevProps.defaultValue, this.props.defaultValue)) {
            const value = Number(this.props.defaultValue);
            if (!isNaN(value)) {
                this.setValue(this.props.defaultValue);
            }
            else {
                this.setValue("");
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
        return typeof this.props.defaultValue === "string" ? (<Label>{this.props.defaultValue}</Label>) : null;
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled, min, max } = this.props as INumberFieldRendererProps;
        const { value } = this.state;
        return <TextField underlined
            componentRef={this._numberField}
            disabled={disabled}
            onChange={(ev, newValue) => {
                this.setValue(newValue);
            }}
            maxLength={20}         
            placeholder={typeof defaultValue === "string" ? defaultValue : ""}
            value={value || ""}
        />;
    }

    protected onValidate(): IValidationResult {
        const { min, max, title, integerOnly } = this.props as INumberFieldRendererProps;
        const value = this.getValue();
        const result = { isValid: true, validationErrors: [] } as IValidationResult;
        if (isNaN(value)) {
            result.isValid = false;
            result.validationErrors.push(`Field "${title}" must be a number.`);
        }
        if (min !== null && min !== undefined && value < min) {
            result.isValid = false;
            result.validationErrors.push(`Field "${title}" must be not less than ${min}.`);
        }
        if (max !== null && max !== undefined && value > max) {
            result.isValid = false;
            result.validationErrors.push(`Field "${title}" must be not more than ${max}.`);
        }
        if (integerOnly === true && !(isFinite(value) && Math.floor(value) === value)) {
            result.isValid = false;
            result.validationErrors.push(`Field "${title}" must be an integer.`);
        }
        return result;
    }

    public hasValue() {
        return !isNaN(this.getValue()) && super.hasValue();
    }

    public getValue(): number {
        const value = super.getValue();
        if (value === undefined || value === null || value === "") {
            return null;
        }
        return Number(value);
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        return mode === FormMode.New ? this.hasValue() : !isEqual(Number(this.getValue()), Number(defaultValue));
    }

}