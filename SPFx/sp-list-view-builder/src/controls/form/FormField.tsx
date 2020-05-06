import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { IFormFieldProps, IFormFieldState, IDateFormFieldProps, ITextFormFieldProps, ILookupFormFieldProps, IUserFormFieldProps } from './IFormFieldProps';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import { TextFieldRenderer, ITextFieldRendererProps } from './fieldRenderer/TextFieldRenderer';
import { DateFieldRenderer, IDateFieldRendererProps } from './fieldRenderer/DateFieldRenderer';
import { UserFieldRenderer, IUserFieldRendererProps } from './fieldRenderer/UserFieldRenderer';
import { BooleanFieldRenderer, IBooleanFieldRendererProps } from './fieldRenderer/BooleanFieldRenderer';
import { IValidationResult } from './fieldRenderer/IBaseFieldRendererProps';
import { DataType, FormMode, ILookupFieldValue, IUserFieldValue } from '../../utilities/Entities';
import { BaseFieldRenderer } from './fieldRenderer/BaseFieldRenderer';

export class FormField extends React.Component<IFormFieldProps | IDateFormFieldProps | ITextFormFieldProps | ILookupFormFieldProps | IUserFormFieldProps, IFormFieldState> {

    private _iconButtonId = getId('iFieldInfo');
    private _fieldControl: React.RefObject<BaseFieldRenderer>;

    constructor(props: IFormFieldProps) {
        super(props);

        this.state = {
            mode: props.mode
        };

        this._fieldControl = React.createRef();
    }

    public componentDidMount() {
    }

    public componentDidUpdate(prevProps: IFormFieldProps, prevState: IFormFieldState) {
        if (prevProps.mode != this.props.mode) {
            this.setState({
                mode: this.props.mode
            });
        }
    }

    public render() {
        const { field, onGetFieldRenderer } = this.props;
        const { mode } = this.state;
        const isHidden = !field || (field.Modes instanceof Array && field.Modes.length > 0 && !field.Modes.some(m => m === mode));
        if (isHidden) {
            return null;
        }
        const fieldRenderer = onGetFieldRenderer instanceof Function
            ? onGetFieldRenderer(this._fieldControl, () => this._getFieldRenderer())
            : this._getFieldRenderer();
        return <div className="form-field">
            {field.Title &&
                (<Stack horizontal verticalAlign="center" styles={{ root: { padding: 2 } }}>
                    <Label className="form-field-label" required={mode !== FormMode.Display && field.Required === true}>{field.Title}</Label>
                    {field.Description &&
                        (<IconButton
                            id={this._iconButtonId}
                            iconProps={{ iconName: 'Info' }}
                            title="Description"
                            ariaLabel="Info"
                            onClick={() => this._setCalloutVisible(!this.state.isCalloutVisible)} />)}
                </Stack>)}
            {this.state.isCalloutVisible && (
                <Callout
                    setInitialFocus={true}
                    target={'#' + this._iconButtonId}
                    onDismiss={() => this._setCalloutVisible(false)}
                    role="alertdialog">
                    <Stack horizontalAlign="start" styles={{ root: { padding: 20 } }}>
                        <Text variant="small">
                            {field.Description}
                        </Text>
                    </Stack>
                </Callout>
            )}
            {fieldRenderer}
        </div>;
    }

    public async validate(disableEvents?: boolean): Promise<IValidationResult> {
        if (this._fieldControl.current) {
            return await this._fieldControl.current.validate(disableEvents);
        }
    }

    public get isValid(): boolean {
        if (this._fieldControl.current) {
            return this._fieldControl.current.isValid;
        }
    }

    public get isDirty(): boolean {
        if (this._fieldControl.current) {
            return this._fieldControl.current.isDirty;
        }
    }

    public get renderer(): BaseFieldRenderer {
        if (this._fieldControl.current) {
            return this._fieldControl.current;
        }
    }

    public get name(): string {
        if (this.props.field) {
            return this.props.field.Name;
        }
    }

    private _setCalloutVisible = (visible: boolean) => {
        this.setState({ isCalloutVisible: visible });
    }

    private _getFieldRenderer(): JSX.Element {
        const { field, defaultValue, onChange, onValidate, disabled } = this.props;
        const { mode } = this.state;
        if (field.Name === "ContentType") {
            field.ReadOnly = true;
            return defaultValue ? defaultValue.Name : null;
        }
        switch (field.DataType) {
            case DataType.Text:
            case DataType.MultiLineText:
                return React.createElement(TextFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: defaultValue,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    multiline: field.DataType === DataType.MultiLineText,
                    maxLength: (this.props as ITextFormFieldProps).maxLength,
                    onValidate: onValidate,
                    onChange: onChange
                } as ITextFieldRendererProps);
            case DataType.Date:
            case DataType.DateTime:
                return React.createElement(DateFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: defaultValue,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    firstDayOfWeek: (this.props as IDateFormFieldProps).firstDayOfWeek,
                    regionalSettings: (this.props as IDateFormFieldProps).regionalSettings,
                    timeZone: (this.props as IDateFormFieldProps).timeZone,
                    shortDateFormat: (this.props as IDateFormFieldProps).shortDateFormat,
                    onValidate: onValidate,
                    onChange: onChange
                } as IDateFieldRendererProps);
            case DataType.Boolean:
                return React.createElement(BooleanFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: defaultValue,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    onValidate: onValidate,
                    onChange: onChange
                } as IBooleanFieldRendererProps);
            case DataType.User:
            case DataType.MultiUser:
                return React.createElement(UserFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    suggestionsLimit: (this.props as IUserFormFieldProps).suggestionsLimit || 10,
                    itemLimit: field.DataType === DataType.MultiUser ? (this.props as IUserFormFieldProps).limit || 5 : 1,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: defaultValue
                        ? field.DataType === DataType.MultiUser
                            ? defaultValue.map((v: any) => { return { Id: v.ID, Title: v.Title, Email: v.EMail, Name: v.Name } as IUserFieldValue })
                            : (defaultValue.ID > 0 ? [{ Id: defaultValue.ID, Title: defaultValue.Title, Email: defaultValue.EMail, Name: defaultValue.Name } as IUserFieldValue] : null)
                        : null,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    onValidate: onValidate,
                    onChange: onChange
                } as IUserFieldRendererProps);
        }

        return null;
        //throw `Field Type "${field.DataType[field.DataType]}" is not supported.`;

    }
}