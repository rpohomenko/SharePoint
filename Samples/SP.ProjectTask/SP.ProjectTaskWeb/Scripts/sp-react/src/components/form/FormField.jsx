import * as React from 'react';
import { TextFieldRenderer } from './TextFieldRenderer';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { DefaultButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { getId } from 'office-ui-fabric-react/lib/Utilities';

export class FormField extends React.Component {

    _iconButtonId = getId('iFieldInfo');

    constructor(props) {
        super(props);
        this.state = {
            field: null
        };

        this._onDismiss = this._onDismiss.bind(this);
    }

    _onRenderDescription = (fieldProps) => {
        return (
            <Text variant="small">
                {fieldProps.description}
            </Text>
        );
    };

    _renderField = () => {
        const { fieldProps } = this.props;
        const { field } = this.state;
        return (
            <div className="form-field">
                <Stack horizontal verticalAlign="center" styles={{ root: { padding: 2 } }}>
                    <Label required={fieldProps.required}>{fieldProps.title}</Label>
                    {fieldProps.description &&
                        (<IconButton
                            id={this._iconButtonId}
                            iconProps={{ iconName: 'Info' }}
                            title="Info"
                            ariaLabel="Info"
                            onClick={this._onIconClick} />)}
                </Stack>
                {this.state.isCalloutVisible && (
                    <Callout
                        setInitialFocus={true}
                        target={'#' + this._iconButtonId}
                        onDismiss={this._onDismiss}
                        role="alertdialog">
                        <Stack horizontalAlign="start" styles={{ root: { padding: 20 } }}>
                            {this._onRenderDescription(fieldProps)}
                        </Stack>
                    </Callout>
                )}
                {field}
            </div>
        );
    }

    _onIconClick = () => {
        this.setState({ isCalloutVisible: !this.state.isCalloutVisible });
    };

    _onDismiss() {
        this.setState({ isCalloutVisible: false });
    }


    _setFieldRenderer = (type) => {
        const { fieldProps, mode } = this.props;
        let field;
        if (type === 'Text') {
            field = <TextFieldRenderer key={fieldProps.internalName} fieldProps={fieldProps} mode={mode} />;

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

        if (field) {
            this.setState({
                field: field
            });
        }
        else {
            throw `Field Type "${type}" is not supported.`;
        }
    }

    componentDidMount() {
        const { fieldProps } = this.props;
        if (fieldProps) {
            this._setFieldRenderer(fieldProps.type);
        }
    }

    render() {
        return this._renderField();
    }
}

export default FormField;