import * as React from 'react';
import { TextFieldRenderer } from './TextFieldRenderer';

export class FormField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            field: null
        };
    }

    _renderField = () => {
        const { fieldProps, mode } = this.props;
        const { field } = this.state;

        if (!field) {
            return null;
        }

        return React.createElement(field, {
            ...fieldProps,
            mode: mode,
            key: fieldProps.internalName
        });
    }

    _registerFieldRenderer = (field) => {
        this.setState({
            field: field
        });
    }

    _catchImportField = (error, type) => {
        throw (`Field Type "${type}", Error: ${error}`);
    }

    _importFieldRenderer(type) {
        if (type === 'Text') {
            return import('./TextFieldRenderer')
                .then(module => this._registerFieldRenderer(module.TextFieldRenderer)).catch(e => this._catchImportField(e, type));
        } /*else if (type.match(/choice/gi)) {
            return import('./ChoiceFieldRenderer')
                .then(module => this._registerFieldRenderer(module.ChoiceFieldRenderer)).catch(e => this._catchImportField(e, type));
        } else if (type.match(/lookup/gi)) {
            return import('./LookupFieldRenderer')
                .then(module => this._registerFieldRenderer(module.LookupFieldRenderer)).catch(e => this._catchImportField(e, type));
        } else if (type === 'Note') {
            return import('./MultilineTextFieldRenderer')
                .then(module => this._registerFieldRenderer(module.MultilineTextFieldRenderer)).catch(e => this._catchImportField(e, type));
        } else if (type === 'Boolean') {
            return import('./BooleanFieldRenderer')
                .then(module => this._registerFieldRenderer(module.BooleanFieldRenderer)).catch(e => this._catchImportField(e, type));
        } else if (type === 'Number') {
            return import('./NumberFieldRenderer')
                .then(module => this._registerFieldRenderer(module.NumberFieldRenderer)).catch(e => this._catchImportField(e, type));
        } else if (type === 'Currency') {
            return import('./CurrencyFieldRenderer')
                .then(module => this._registerFieldRenderer(module.CurrencyFieldRenderer)).catch(e => this._catchImportField(e, type));
        } else if (type === 'URL') {
            return import('./UrlFieldRenderer')
                .then(module => this._registerFieldRenderer(module.UrlFieldRenderer)).catch(e => this._catchImportField(e, type));
        } else if (type === 'DateTime') {
            return import('./DateTimeFieldRenderer')
                .then(module => this._registerFieldRenderer(module.DateTimeFieldRenderer)).catch(e => this._catchImportField(e, type));
        } else if (type.match(/user/gi)) {
            return import('./UserFieldRenderer')
                .then(module => this._registerFieldRenderer(module.UserFieldRenderer)).catch(e => this._catchImportField(e, type));
        }*/

        throw `Field Type "${type}" is not supported.`;
    }

    async componentDidMount() {
        const { fieldProps } = this.props;
        if (fieldProps) {
            await this._importFieldRenderer(fieldProps.type);
        }
    }

    render() {
        return this._renderField();
    }
}

export default FormField;