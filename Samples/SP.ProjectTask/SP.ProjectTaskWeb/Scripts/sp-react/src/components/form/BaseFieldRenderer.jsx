import * as React from 'react';
import ErrorBoundary from '../../ErrorBoundary';

export class BaseFieldRenderer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: null,
            isValid: false,
            validationErrors: [],
            validators: []
        };

    }

    _renderNewForm() {
        throw (`Method _renderNewForm is not yet implemented, field type: ${this.props.type}.`);
    }

    _renderEditForm = () => {
        throw (`Method _renderEditForm is not yet implemented, field type: ${this.props.type}.`);
    }

    _renderDispForm = () => {
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

    validate() {
        let isValid, validationErrors;
        this.setState({
            isValid: isValid,
            validationErrors: validationErrors
        });
        return isValid;
    }

    getValue() {
        return this.state.value;
    }

    setValue(newValue) {
        this.setState({ value: newValue }, () => {
            this.validate();
        });
    }

    render() {
        const { mode } = this.props;
        const { isValid, validationErrors } = this.state;
        return (
            <React.Fragment>
                <ErrorBoundary>
                    {mode === /*FormMode.New*/2 ? this._renderNewForm() : null}
                    {mode === /*FormMode.Edit*/ 1 ? this._renderEditForm() : null}
                    {mode === /*FormMode.Display*/ 0 ? this_.renderDispForm() : null}
                </ErrorBoundary>
                {!isValid ? this._renderValidationErrors(validationErrors) : null}
            </React.Fragment>
        );
    }
}

export default BaseFieldRenderer;