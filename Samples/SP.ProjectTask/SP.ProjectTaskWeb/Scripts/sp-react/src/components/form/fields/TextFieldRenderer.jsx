import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class TextFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);
    }

    _renderNewForm() {
        return this._renderNewOrEditForm();
    }

    _renderEditForm() {
        return this._renderNewOrEditForm();
    }

    _renderDispForm() {
        return (<Label>{this.props.currentValue}</Label>);
    }

    _renderNewOrEditForm() {
        const { fieldProps, currentValue, disabled } = this.props;
        const { item, value } = this.state;
        return (<TextField underlined ref={ref => this._textField = ref}
            required={/*fieldProps.required*/false}
            disabled={disabled}
            onChange={(ev, newValue) => {
                this.setValue(newValue);
            }}
            value={value || ''}
            defaultValue={currentValue}
        />);
    }

    _validate = () => {
        let { isValid, validationErrors } = {};
        isValid = true;
        return { isValid: isValid, validationErrors: validationErrors };
    }

    hasValue() {
        return this.getValue() !== "" && super.hasValue();
    }
}

export default TextFieldRenderer;