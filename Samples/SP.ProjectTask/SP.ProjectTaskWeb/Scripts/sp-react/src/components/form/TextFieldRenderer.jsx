import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class TextFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            currentValue: props.value
        };
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
        const {fieldProps} = this.props;
        const { value } = this.state;
        return (<TextField underlined required={/*fieldProps.required*/false}
            onChange={(ev, newValue) => {
                this.setValue(newValue);
            }}
            defaultValue ={ value }       
        />);
    }
}

export default TextFieldRenderer;