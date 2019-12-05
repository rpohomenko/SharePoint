import * as React from 'react';
import ErrorBoundary from '../../../ErrorBoundary';

export class BaseFieldRenderer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {           
            value: props.currentValue,
            isValid: undefined,
            validationErrors: [],
            validators: []
        };
    }

    componentDidMount(){            
    }

    render() {
        const { mode, fieldProps } = this.props;
        const { isValid, validationErrors } = this.state;
        if(!fieldProps) return null;

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

    hasValue() {
        return this.getValue() !== null && this.getValue() !== undefined;
    }

    validate(ignoreErrors) {
        const { fieldProps, onValidate } = this.props;
        let { isValid, validationErrors } = this._validate();
        if (!validationErrors) {
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
            validationErrors: ignoreErrors ? null : validationErrors
        }, () => {
            if (!ignoreErrors && typeof onValidate === "function") {
                onValidate(this, isValid, validationErrors);
            }
        });
        return isValid;
    }

    getValue() {
        return this.state.value;
    }

    setValue(newValue) {       
        this.setState({ value: newValue }, () => {
            if (this.validate()) {
               this._onChangeValue(newValue);
            }
        });
    }

    _onChangeValue(value){
        const { fieldProps } = this.props;
        if(typeof fieldProps.onChangeValue === "function"){
            fieldProps.onChangeValue(value);
        }
    }

    isValid() {
        const { isValid } = this.state;
        return isValid;
    }

    isDirty() {
        const { mode, currentValue } = this.props;
        const { value } = this.state;
        return mode === 2 ? this.hasValue() : value !== currentValue;
    }
}

export default BaseFieldRenderer;