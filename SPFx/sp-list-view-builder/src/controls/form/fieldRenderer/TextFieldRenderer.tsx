import * as React from 'react';
import { TextField, ITextField, Label } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { FormMode } from '../../../utilities/Entities';

export interface ITextFieldRendererProps extends IBaseFieldRendererProps {
    multiline?: boolean;
    maxLength?: number;
}

export class TextFieldRenderer extends BaseFieldRenderer {

    private _textField: React.RefObject<ITextField>;

    constructor(props: ITextFieldRendererProps) {
        super(props);
        this._textField = React.createRef();
    }


    public componentDidMount() {
        if (typeof this.props.defaultValue === "string") {
            this.setValue(this.props.defaultValue);
        }
    }

    public componentDidUpdate(prevProps: ITextFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (prevProps.defaultValue !== this.props.defaultValue) {
            if (typeof this.props.defaultValue === "string") {
                this.setValue(this.props.defaultValue);
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
        const { defaultValue, disabled, multiline, maxLength } = this.props as ITextFieldRendererProps;
        const { value } = this.state;
        return <TextField underlined
            componentRef={this._textField}
            disabled={disabled}
            multiline={multiline}
            maxLength={maxLength}
            styles={{ root: { minWidth: 180 } }}
            onChange={(ev, newValue) => {
                this.setValue(newValue);
            }}
            placeholder={typeof defaultValue === "string" ? defaultValue : ""}
            value={typeof value === "string" ? value : ""}
        />;
    }

    public hasValue() {
        return this.getValue() !== "" && super.hasValue();
    }

    public getValue() {
        const value = super.getValue();
        if (value === undefined || value === null || value === "") {
            return null;
        }
        return String(value);
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        return mode === FormMode.New ? this.hasValue() : (this.getValue() || "") !== (defaultValue || "");
    }

}