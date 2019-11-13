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
        return (<Label>{this.props.value}</Label>);
    }

    _renderNewOrEditForm() {
        const { fieldProps } = this.props;
        const { currentValue, item } = this.state;
        return (<TextField underlined ref={ref=>this._textField = ref} required={/*fieldProps.required*/false}
            onChange={(ev, newValue) => {
                this.setValue(newValue);
            }}
            defaultValue={currentValue}
        />);
    }

    _validate = () => {        
        let { isValid, validationErrors } = {};
        isValid = true;
        return {isValid: isValid, validationErrors: validationErrors };
    }

    hasValue() {
       return this.getValue() !== "" && super.hasValue();
    }
}

export default TextFieldRenderer;