import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { getId } from 'office-ui-fabric-react/lib/Utilities';

import { TextFieldRenderer } from './TextFieldRenderer';
import { LookupFieldRenderer } from './LookupFieldRenderer';

export class FormField extends React.Component {

    _iconButtonId = getId('iFieldInfo');

    constructor(props) {
        super(props);
        this.state = {
            ...this.props,
            field: null
        };

        this._onDismiss = this._onDismiss.bind(this);
    }

    componentDidMount() {

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
        //const { field } = this.state;
        const field = this._getFieldRenderer(fieldProps.type);
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

    _getFieldRenderer = (type) => {
        const { fieldProps, mode, item, onValidate, disabled } = this.props;
        //const { disabled } = this.state;
        let currentValue = item ? item[fieldProps.name] : undefined;
        let field;
        if (type === 'text') {
            field = <TextFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} value={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        else if (type === 'lookup') {
            field = <LookupFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} value={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        if (field) {
            return field;
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
        let isDirty = undefined;
        if (this._fieldControl) {
            isDirty = this._fieldControl.isDirty();
        }
        if(isDirty === undefined) {
            if (mode === 2) isDirty = true;
        }
        return isDirty;
    }

    isValid() {
        const { mode } = this.props;
        let isValid = undefined;
        if (this._fieldControl) {
            isValid = this._fieldControl.isValid();
        }
        if (isValid === undefined) {
            isValid = true;
        }
        return isValid;
    }

    validate() {
        if (this._fieldControl) {
            return this._fieldControl.validate();
        }
    }

    getControl() {
        return this._fieldControl;
    }

    onSaveHandler = (newItem) => {
        if (newItem /*&& this.isDirty()*/ && this.isValid()) {
            const { fieldProps } = this.props;
            newItem[fieldProps.name] = this.getFieldValue();
        }
    }
}

export default FormField;