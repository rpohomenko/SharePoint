import * as React from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState, ValidationResult } from './IBaseFieldRendererProps';

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
            onChange={(ev, newValue) => {
                this.setValue(newValue);
            }}
            placeholder={typeof defaultValue === "string" ? defaultValue : undefined}
            value={typeof value === "string" ? value : undefined}
        />;
    }

    public hasValue() {
        return this.getValue() !== "" && super.hasValue();
    }
}