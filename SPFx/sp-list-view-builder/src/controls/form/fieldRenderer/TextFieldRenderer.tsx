import * as React from 'react';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState, ValidationResult } from './IBaseFieldRendererProps';

export interface ITextFieldRendererProps extends IBaseFieldRendererProps {
    multiline?: boolean;
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
        return (<Label>{this.props.defaultValue}</Label>);
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled, multiline } = this.props as ITextFieldRendererProps;
        const { value } = this.state;
        return (<TextField underlined
            componentRef={this._textField}
            disabled={disabled}
            multiline={multiline}
            onChange={(ev, newValue) => {
                this.setValue(newValue);
            }}
            placeholder={defaultValue}
            value={value}
        />);
    }

    public hasValue() {
        return this.getValue() !== "" && super.hasValue();
    }
}