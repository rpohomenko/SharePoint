import * as React from 'react';
import ErrorBoundary from '../../ErrorBoundary';
import { underline } from 'ansi-colors';

export class BaseFieldRenderer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentValue: props.value,
            value: props.value,
            isValid: false,
            validationErrors: [],
            validators: []
        };

    }

    render() {
        const { mode } = this.props;
        const { isValid, validationErrors } = this.state;
        return (
            <React.Fragment>
                <ErrorBoundary>
                    {mode === /*FormMode.New*/2 ? this._renderNewForm() : null}
                    {mode === /*FormMode.Edit*/ 1 ? this._renderEditForm() : null}
                    {mode === /*FormMode.Display*/ 0 ? this._renderDispForm() : null}
                </ErrorBoundary>
                {!isValid ? this._renderValidationErrors(validationErrors) : null}
            </React.Fragment>
        );
    }

    _renderNewForm() {
        throw (`Method _renderNewForm is not yet implemented, field type: ${this.props.type}.`);
    }

    _renderEditForm() {
        throw (`Method _renderEditForm is not yet implemented, field type: ${this.props.type}.`);
    }

    _renderDispForm() {
        throw (`Method _renderDispForm is not yet implemented, field type: ${this.props.type}.`);
    }

    _renderValidationErrors = (validationErrors) => {
        if (!validationErrors) {
            return null;
        }

        const errorStyle = {
            color: 'red'
        };
        return (
            <React.Fragment>
                {validationErrors.map((err, i) => <div key={`err_${i}`} style={errorStyle}>{err}</div>)}
            </React.Fragment>
        );
    }

    _validate = () => {
        throw (`Method _validate is not yet implemented, field type: ${this.props.type}.`);
    }

    hasValue(){
       return this.getValue() !== null && this.getValue() !== undefined;
    }

    validate() {
        const { fieldProps, onValidate } = this.props;
        let { isValid, validationErrors } = this._validate();
        if(!validationErrors){
            validationErrors = [];
        }
        if (fieldProps.required) {
            if (!this.hasValue()) {
                isValid = false;
                validationErrors.push(`Field "${fieldProps.title}" is required.`);
            }
        }
        this.setState({
            isValid: isValid,
            validationErrors: validationErrors
        });
        if (typeof onValidate === "function") {
            onValidate(this, isValid, validationErrors);
        }
        return isValid;
    }

    getValue() {
        return this.state.value;
    }

    setValue(newValue) {
        this.setState({ value: newValue }, () => {
            if (this.validate()) {
            }
        });
    }

    isDirty() {
        const { mode } = this.props;
        const { currentValue, value } = this.state;
        return mode === 2 ? this.hasValue() : value !== currentValue;
    }
}

export default BaseFieldRenderer;