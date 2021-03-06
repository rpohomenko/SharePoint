import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { getId } from 'office-ui-fabric-react/lib/Utilities';

import { TextFieldRenderer } from './TextFieldRenderer';
import { RichTextFieldRenderer } from './RichTextFieldRenderer';
import { LookupFieldRenderer } from './LookupFieldRenderer';
import { ChoiceFieldRenderer } from './ChoiceFieldRenderer';
import { ChoiceFieldRenderer2 } from './ChoiceFieldRenderer2';
import { DateFieldRenderer } from './DateFieldRenderer';
import { DateTimeFieldRenderer } from './DateTimeFieldRenderer';
import { UserFieldRenderer } from './UserFieldRenderer';
import { SearchFieldRenderer } from './SearchFieldRenderer';

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
        const { fieldProps, onRenderField } = this.props;
        //const { field } = this.state;
        const field = typeof onRenderField === "function" ? onRenderField(() => this._getFieldRenderer(fieldProps.type)) : this._getFieldRenderer(fieldProps.type);
        return (
            <div className="form-field">
                {fieldProps.title &&
                (<Stack horizontal verticalAlign="center" styles={{ root: { padding: 2 } }}>
                    <Label className="form-field-label" required={fieldProps.required}>{fieldProps.title}</Label>
                    {fieldProps.description &&
                        (<IconButton
                            id={this._iconButtonId}
                            iconProps={{ iconName: 'Info' }}
                            title="Info"
                            ariaLabel="Info"
                            onClick={this._onIconClick} />)}
                </Stack>)}
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

        let currentValue = item ? item[fieldProps.name] : fieldProps.value;
        let field;
        if (type === 'text') {
            field = <TextFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} currentValue={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        if (type === 'richtext') {
            field = <RichTextFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} currentValue={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        else if (type === 'lookup') {
            field = <LookupFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} currentValue={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        else if (type === 'choice') {
            field = <ChoiceFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} currentValue={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        else if (type === 'choice2') {
            field = <ChoiceFieldRenderer2 ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} currentValue={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        else if (type === 'date') {
            field = <DateFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} currentValue={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        else if (type === 'datetime') {
            field = <DateTimeFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} currentValue={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        else if (type === 'user') {
            field = <UserFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} currentValue={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
        }
        else if (type === 'search') {
            field = <SearchFieldRenderer ref={(ref) => this._fieldControl = ref} disabled={disabled} key={fieldProps.name} currentValue={currentValue} item={item} fieldProps={fieldProps} mode={mode} onValidate={onValidate} />;
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

    setFieldValue(value) {
        if (this._fieldControl) {
            return this._fieldControl.setValue(value);
        }
    }

    getFieldName() {
        const { fieldProps } = this.props;
        if (fieldProps) {
            return fieldProps.name;
        }
        return null;
    }

    isDirty() {
        const { mode } = this.props;
        let isDirty = undefined;
        if (this._fieldControl) {
            isDirty = this._fieldControl.isDirty();
        }
        if (isDirty === undefined) {
            if (mode === 2) isDirty = true;
            else isDirty = false;
        }
        return isDirty;
    }

    isValid() {
        let isValid = undefined;
        if (this._fieldControl) {
            isValid = this._fieldControl.isValid();
        }
        if (isValid === undefined) {
            isValid = this.validate(true);
        }
        return isValid;
    }

    validate(ignoreErrors) {
        if (this._fieldControl) {
            return this._fieldControl.validate(ignoreErrors);
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