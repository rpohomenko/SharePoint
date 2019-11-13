import * as React from 'react';
import { TextFieldRenderer } from './TextFieldRenderer';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { getId } from 'office-ui-fabric-react/lib/Utilities';

export class FormField extends React.Component {

    _iconButtonId = getId('iFieldInfo');

    constructor(props) {
        super(props);
        this.state = {
            ...props,
            field: null
        };

        this._onDismiss = this._onDismiss.bind(this);
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

    _onDismiss = () => {
        this.setState({ isCalloutVisible: false });
    }

    _setFieldRenderer = (type) => {
        const { fieldProps, mode, item, onValidate } = this.props;
        let currentValue = item ? item[fieldProps.name] : undefined;
        let field;
        if (type === 'text') {
            field = <TextFieldRenderer ref={(ref) => this._fieldControl = ref} key={fieldProps.name} value={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        if (field) {
            this.setState({
                field: field
            });
        }
        else {
            throw `Field Type "${type}" is not supported.`;
        }
    }

    getFieldValue() {
        if (this._fieldControl) {
            return this._fieldControl.getValue();
        }
    }

    isDirty() {
        const { mode } = this.props;
        if (this._fieldControl) {
            return this._fieldControl.isDirty();
        }
        else {
            if (mode === 2) return true;
        }
    }

    isValid() {
        const { mode } = this.props;
        if (this._fieldControl) {
            return this._fieldControl.validate();
        }
        else {
            if (mode === 2) return true;
        }
    }

    getControl() {
        return this._fieldControl;
    }

    onSaveHandler = (newItem) => {
        if (newItem && this.isDirty()) {
            const { fieldProps } = this.props;
            newItem[fieldProps.name] = this.getFieldValue();
        }
    }
}

export default FormField;