import * as React from 'react';
import { Label, IconButton, Callout, Stack, Text, getId } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { IFormFieldProps, IFormFieldState, IDateFormFieldProps, ITextFormFieldProps, ILookupFormFieldProps, IUserFormFieldProps, INumberFormFieldProps, IChoiceFormFieldProps } from './IFormFieldProps';
import { TextFieldRenderer, ITextFieldRendererProps } from './fieldRenderer/TextFieldRenderer';
import { DateFieldRenderer, IDateFieldRendererProps } from './fieldRenderer/DateFieldRenderer';
import { UserFieldRenderer, IUserFieldRendererProps } from './fieldRenderer/UserFieldRenderer';
import { BooleanFieldRenderer, IBooleanFieldRendererProps } from './fieldRenderer/BooleanFieldRenderer';
import { LookupFieldRenderer, ILookupFieldRendererProps } from './fieldRenderer/LookupFieldRenderer';
import { IValidationResult } from './fieldRenderer/IBaseFieldRendererProps';
import { DataType, FormMode, ILookupFieldValue, IUserFieldValue, IListItem, IFormField } from '../../utilities/Entities';
import { BaseFieldRenderer } from './fieldRenderer/BaseFieldRenderer';
import { sp } from '@pnp/sp/presets/all';
import { isEqual } from "@microsoft/sp-lodash-subset";
import { RichTextFieldRenderer } from './fieldRenderer/RichTextFieldRenderer';
import { NumberFieldRenderer } from './fieldRenderer/NumberFieldRenderer';
import { ChoiceFieldRenderer, IChoiceFieldRendererProps } from './fieldRenderer/ChoiceFieldRenderer';
import { UrlFieldRenderer, IUrlFieldRendererProps } from './fieldRenderer/UrlFieldRenderer';
import { ContentTypeFieldRenderer, IContentTypeFieldRendererProps } from './fieldRenderer/ContentTypeFieldRenderer';

export class FormField extends React.Component<IFormFieldProps | IDateFormFieldProps | ITextFormFieldProps | IChoiceFormFieldProps | INumberFormFieldProps | ILookupFormFieldProps | IUserFormFieldProps, IFormFieldState> {

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
        if (!isEqual(prevProps.mode, this.props.mode)) {
            this.setState({
                mode: this.props.mode
            });
        }
    }

    public componentWillUnmount() {
        if (this._fieldControl) {
            this._fieldControl = undefined;
        }
    }

    public render() {
        const { field, label, onGetFieldRenderer } = this.props;
        const { mode } = this.state;
        const isHidden = !field || (field.Modes instanceof Array && field.Modes.length > 0 && !field.Modes.some(m => m === mode));
        if (isHidden) {
            return null;
        }
        const fieldRenderer = onGetFieldRenderer instanceof Function
            ? onGetFieldRenderer(this._fieldControl, () => this._getFieldRenderer())
            : this._getFieldRenderer();
        return <div className="form-field">
            { label || field.Title &&
                (<Stack horizontal verticalAlign="center" styles={{ root: { padding: 2 } }}>
                    <Label className="form-field-label" required={mode !== FormMode.Display && field.Required === true}>{label || field.Title}</Label>
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

    public get value(): any {
        if (this._fieldControl.current) {
            return this._fieldControl.current.getValue();
        }
    }

    private _setCalloutVisible = (visible: boolean) => {
        this.setState({ isCalloutVisible: visible });
    }

    private _getFieldRenderer(): JSX.Element {
        const { field, defaultValue, onChange, onValidate, disabled, list } = this.props;
        const { mode } = this.state;
        let setDefaultValue: any = defaultValue;
        if (mode === FormMode.New) {
            if (defaultValue === null || defaultValue === undefined) {
                setDefaultValue = field.DefaultValue;
            }
        }
        if (field.Name === "ContentType") {
            return React.createElement(ContentTypeFieldRenderer, {
                key: field.Name,
                ref: this._fieldControl,
                list: list,
                disabled: field.ReadOnly === true || disabled === true,
                defaultValue: setDefaultValue,
                required: field.Required === true,
                mode: mode,
                dataType: field.DataType,
                title: field.Title,             
                onValidate: onValidate,
                onChange: onChange
            } as IContentTypeFieldRendererProps);       
        }      
        switch (field.DataType) {
            case DataType.Text:
            case DataType.MultiLineText:
                return React.createElement(TextFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: setDefaultValue,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    multiline: field.DataType === DataType.MultiLineText,
                    maxLength: (this.props as ITextFormFieldProps).maxLength,
                    onValidate: onValidate,
                    onChange: onChange
                } as ITextFieldRendererProps);
            case DataType.RichText:
                return React.createElement(RichTextFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: this.decodeHtml(setDefaultValue),
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    onValidate: onValidate,
                    onChange: onChange
                } as ITextFieldRendererProps);
            case DataType.Number:
                return React.createElement(NumberFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: setDefaultValue,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    min: (this.props as INumberFormFieldProps).min,
                    max: (this.props as INumberFormFieldProps).max,
                    onValidate: onValidate,
                    onChange: onChange
                } as ITextFieldRendererProps);
            case DataType.Date:
            case DataType.DateTime:
                return React.createElement(DateFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: setDefaultValue,
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
                    defaultValue: setDefaultValue,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    onValidate: onValidate,
                    onChange: onChange
                } as IBooleanFieldRendererProps);

            case DataType.Choice:
            case DataType.MultiChoice:
                return React.createElement(ChoiceFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    multiSelect: field.DataType === DataType.MultiChoice,
                    choices: field.Choices,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: !!setDefaultValue
                        ? (field.DataType === DataType.Choice
                            ? setDefaultValue && (setDefaultValue instanceof Array ? setDefaultValue : [setDefaultValue])
                            : setDefaultValue && (setDefaultValue instanceof Array ? setDefaultValue
                                : setDefaultValue.results))
                        : null,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    onValidate: onValidate,
                    onChange: onChange
                } as IChoiceFieldRendererProps);
            case DataType.User:
            case DataType.MultiUser:
                const userValues: IUserFieldValue[] = setDefaultValue
                    ? field.DataType === DataType.MultiUser
                        ? setDefaultValue instanceof Array ? setDefaultValue
                            : setDefaultValue.results instanceof Array && setDefaultValue.results.length > 0 ? setDefaultValue.results.map((v: any) => { return { Id: v.ID, Title: v.Title, Email: v.EMail, Name: v.Name } as IUserFieldValue; }) : null
                        : (setDefaultValue.ID > 0 ? [{ Id: setDefaultValue.ID, Title: setDefaultValue.Title, Email: setDefaultValue.EMail, Name: setDefaultValue.Name } as IUserFieldValue] : null)
                    : null;
                return React.createElement(UserFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    suggestionsLimit: (this.props as IUserFormFieldProps).suggestionsLimit || 10,
                    selectionLimit: field.DataType === DataType.MultiUser ? (this.props as IUserFormFieldProps).limit || 5 : 1,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: userValues,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    onValidate: onValidate,
                    onChange: onChange
                } as IUserFieldRendererProps);
            case DataType.Lookup:
            case DataType.MultiLookup:
                const lookupValues = setDefaultValue
                    ? field.DataType === DataType.MultiLookup
                        ? setDefaultValue instanceof Array ? setDefaultValue
                            : setDefaultValue.results instanceof Array ? setDefaultValue.results.map(v => { return { Id: v.ID, Title: v[field.LookupFieldName || "Title"] } as ILookupFieldValue; }) : null
                        : (setDefaultValue.ID > 0 ? [{ Id: setDefaultValue.ID, Title: setDefaultValue[field.LookupFieldName || "Title"] } as ILookupFieldValue] : null)
                    : null;
                return React.createElement(LookupFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    list: sp.web.lists.getById(field.LookupListId),
                    fieldName: field.LookupFieldName,
                    suggestionsLimit: (this.props as ILookupFormFieldProps).suggestionsLimit || 10,
                    itemLimit: field.DataType === DataType.MultiLookup ? (this.props as ILookupFormFieldProps).limit || 5 : 1,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: lookupValues,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.OutputType !== undefined ? field.OutputType : field.DataType,
                    regionalSettings: (this.props as IDateFormFieldProps).regionalSettings,
                    timeZone: (this.props as IDateFormFieldProps).timeZone,
                    title: field.Title,
                    onValidate: onValidate,
                    onChange: onChange
                } as ILookupFieldRendererProps);
            case DataType.URL:
                return React.createElement(UrlFieldRenderer, {
                    key: field.Name,
                    ref: this._fieldControl,
                    disabled: field.ReadOnly === true || disabled === true,
                    defaultValue: setDefaultValue,
                    required: field.Required === true,
                    mode: mode,
                    dataType: field.DataType,
                    title: field.Title,
                    onValidate: onValidate,
                    onChange: onChange
                } as IUrlFieldRendererProps);
        }

        return null;
        //throw `Field Type "${field.DataType[field.DataType]}" is not supported.`;
    }

    private decodeHtml(html: string) {
        if (html) {
            const textarea = document.createElement("textarea");
            textarea.innerHTML = html;
            return textarea.value;
        }
        return null;
    }
}