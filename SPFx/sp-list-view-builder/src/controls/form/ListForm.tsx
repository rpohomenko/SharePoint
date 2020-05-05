import * as React from 'react';
import { IListFormProps, IListFormState } from './IListFormProps';
import { FormField } from './FormField';
import { FormMode, IListItem, IFormField, DataType } from '../../utilities/Entities';
import { cancelable, CancelablePromise } from 'cancelable-promise';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { IItem } from '@pnp/sp/items';
import { IListItemFormUpdateValue } from '@pnp/sp/lists';
import moment from 'moment';
import { IRegionalSettingsInfo } from '@pnp/sp/regional-settings';
import SPService from '../../utilities/SPService';
import { IValidationResult } from './fieldRenderer/IBaseFieldRendererProps';

interface CancelablePromise extends Promise<any> {
    cancel: () => void;
    finally: (onfinally?: (() => void) | undefined | null) => Promise<any>;
}

export class ListForm extends React.Component<IListFormProps, IListFormState> {

    private _formFields: FormField[];
    private _promise: CancelablePromise;
    private _itemChanges: IListItem;
    private _isValid: boolean;
    private _isMounted: boolean;
    private _regionalSettings: IRegionalSettingsInfo;

    constructor(props: IListFormProps) {
        super(props);

        this.state = {
            mode: props.mode,
            item: null
        };
    }

    public async componentDidMount() {
        if (this.props.regionalSettings) {
            this._regionalSettings = await this.props.regionalSettings;
        }
        if (this._regionalSettings) {
            const locale = SPService.getLocaleName(this._regionalSettings.LocaleId);
            moment.locale(locale);
        }
        if (this.state.mode === FormMode.Edit || this.state.mode === FormMode.Display) {
            await this.loadItem();
        }
        this._isMounted = true;
    }

    public componentWillUnmount() {
        if (this._promise) {
            this._promise.cancel();
        }
        this._isMounted = false;
    }

    public async componentDidUpdate(prevProps: IListFormProps, prevState: IListFormState) {
        if (prevProps.mode != this.props.mode) {
            this.setState({ mode: this.props.mode });
        }
        if (prevProps.itemId != this.props.itemId || prevProps.list != this.props.list) {
            if (this.props.itemId > 0) {
                await this.loadItem();
            }
        }
    }

    public async loadItem(): Promise<IListItem> {
        if (this._promise) {
            //this._promise.cancel();
            //this._promise = undefined;
            return;
        }
        this._itemChanges = undefined;
        if (this.props.list && (this.props.mode === FormMode.Display || this.props.mode === FormMode.Edit)) {
            const itemId = this.state.item ? this.state.item.ID : this.props.itemId;
            if (itemId && itemId > 0) {
                const spItem = this.props.list.items.getById(itemId);
                this.setState({ isLoading: true });
                this._promise = cancelable(this.getItem(spItem));
                this._promise.finally(() => {
                    this._promise = null;
                    this.setState({ isLoading: false });
                });
                const item = await this._promise;
                this.setState({ item: item });
                return item;
            }
            else {
                //this.setState({ item: null });
            }
        }
    }

    public render() {
        const { fields, onChange } = this.props;
        const { mode, item, isLoading, isSaving, error } = this.state;

        this._formFields = [];
        return <div className="list-form">
            <div style={{ minHeight: 40 }}>
                {isLoading && <ProgressIndicator label="Loading..." />}
                {isSaving && <ProgressIndicator label="Saving..." />}
                {error && <span style={{
                    color: 'red',
                    display: 'block',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                }}>{error}</span>}
            </div>
            <div style={{ marginTop: 2 }}>
                {!isLoading && fields instanceof Array && fields.length > 0
                    && fields.map(field => <FormField key={field.Id || field.Name}
                        disabled={isLoading || isSaving}
                        defaultValue={item ? item[field.Name] : undefined}
                        ref={ref => {
                            if (ref != null) {
                                this._formFields.push(ref);
                            }
                        }}
                        field={field}
                        mode={mode}
                        regionalSettings={this.props.regionalSettings}
                        timeZone={this.props.timeZone}
                        onValidate={(result) => {

                        }}
                        onChange={(value, isDirty) => {
                            const itemChanges: IListItem = this._itemChanges || {} as IListItem;
                            if (isDirty === true) {
                                itemChanges[field.Name] = value;
                            }
                            else {
                                delete itemChanges[field.Name];
                            }
                            this._itemChanges = itemChanges;
                            if (onChange instanceof Function) {
                                onChange(field, value, isDirty);
                            }
                        }} />)}
            </div>
        </div>;
    }

    public async save(): Promise<IListItem> {
        const { list, itemId } = this.props;
        const { mode, item } = this.state;
        if (this._promise) {
            //this._promise.cancel();
            //this._promise = undefined;
            return;
        }
        if (list && this._itemChanges && (mode === FormMode.New || mode === FormMode.Edit)) {
            if (mode === FormMode.New) {
                await this.validate(true);
                if (this.isValid && this.isDirty) {
                    this.setState({ isSaving: true, error: undefined });
                    this._promise = cancelable(list.items.add(this._itemChanges));
                    this._promise.finally(() => {
                        this._promise = null;
                        this.setState({ isSaving: false });
                    }).catch((error) => {
                        this.setState({ error: error.message });
                    });

                    const result = await this._promise;

                    if (result) {
                        this._itemChanges = undefined;
                        this.setState({ isLoading: true });
                        this._promise = cancelable(this.getItem(result.item));
                        this._promise.finally(() => {
                            this._promise = null;
                            this.setState({ isLoading: false });
                        }).catch((error) => {
                            this.setState({ error: error.message });
                        });
                        const updatedItem = await this._promise;
                        if (updatedItem) {
                            this.setState({ item: updatedItem, mode: FormMode.Edit });
                        }
                        return updatedItem;
                    }
                }
            }
            else if (item && mode === FormMode.Edit) {
                const formUpdateValues: IListItemFormUpdateValue[] = [];
                for (const fName in this._itemChanges) {
                    formUpdateValues.push({ FieldName: fName, FieldValue: this.fieldValueToString(fName, this._itemChanges[fName]) });
                }
                if (item["owshiddenversion"]) {
                    formUpdateValues.push({ FieldName: "owshiddenversion", FieldValue: String(item["owshiddenversion"]) });
                }
                await this.validate(true);
                if (this.isValid && this.isDirty) {
                    this.setState({ isSaving: true, error: undefined });
                    this._promise = cancelable(list.items.getById(item.ID).validateUpdateListItem(formUpdateValues, false).then(formValues => {
                        return (formValues as any).ValidateUpdateListItem ? (formValues as any).ValidateUpdateListItem.results : formValues;
                    }));
                    this._promise.finally(() => {
                        this._promise = null;
                        this.setState({ isSaving: false });
                    }).catch((error) => {
                        this.setState({ error: error.message });
                    });

                    const result: IListItemFormUpdateValue[] = await this._promise;

                    if (result instanceof Array) {
                        const errors = result.filter(field => field.HasException === true);
                        if (errors.length > 0) {
                            for (const formField of this._formFields) {
                                const validationResult: IValidationResult = { isValid: false, validationErrors: [] };
                                for (const error of errors.filter(err => formField.name === err.FieldName)) {
                                    validationResult.validationErrors.push(error.ErrorMessage);
                                }
                                if (validationResult.validationErrors.length > 0) {
                                    formField.renderer.setValidationResult(validationResult);
                                }
                            }
                        }
                        else {
                            this._itemChanges = undefined;
                            this._promise = cancelable(this.getItem(list.items.getById(item.ID)))
                                .finally(() => {
                                    this._promise = null;
                                    this.setState({ isLoading: false });
                                }).catch((error) => {
                                    this.setState({ error: error.message });
                                });
                            const updatedItem = await this._promise;
                            if (updatedItem) {
                                this.setState({ item: updatedItem });
                            }
                            return updatedItem;
                        }
                    }
                }
            }
        }
    }

    private fieldValueToString(fieldName: string, value: any) {
        const fields = this.props.fields.filter(f => f.Name === fieldName);
        if (fields.length > 0) {
            const field = fields[0];
            if (field.DataType === DataType.Date || field.DataType === DataType.DateTime) {
                value = value ? moment(new Date(value)).format("L LT") : value;
            }
        }
        return value;
    }

    private async getItem(item: IItem): Promise<IListItem> {
        if (!item) return;
        let select = [], expand = [];
        select.push("ID");
        select.push("EffectiveBasePermissions");
        select.push("ContentTypeId");
        select.push("owshiddenversion");

        for (const formField of this.props.fields) {
            if (formField.Name === "DocIcon") {
                continue;
            }
            else if (formField.Name === "LinkTitle" || formField.Name === "LinkTitleNoMenu") {
                if (select.indexOf("Title") === -1) {
                    select.push("Title");
                }
            }
            else if (formField.Name === "ContentType") {
                select.push("ContentType/Name");
                expand.push("ContentType");
            }
            else if (formField.DataType === DataType.Lookup
                || formField.DataType === DataType.MultiLookup
            ) {
                const lookupField = formField as IFormField;
                if (lookupField.PrimaryFieldName && lookupField.LookupFieldName) {
                    select.push(`${lookupField.PrimaryFieldName}/${lookupField.LookupFieldName}`);
                    if (expand.indexOf(lookupField.PrimaryFieldName) === -1) {
                        expand.push(lookupField.PrimaryFieldName);
                    }
                }
                else {
                    select.push(`${lookupField.Name}/ID`);
                    select.push(`${lookupField.Name}/${lookupField.LookupFieldName || "Title"}`);
                    if (expand.indexOf(lookupField.Name) === -1) {
                        expand.push(lookupField.Name);
                    }
                }
            }
            else if (formField.DataType === DataType.User
                || formField.DataType === DataType.MultiUser
            ) {
                const lookupField = formField as IFormField;
                select.push(`${lookupField.Name}/ID`);
                select.push(`${lookupField.Name}/Title`);
                select.push(`${lookupField.Name}/Name`);
                select.push(`${lookupField.Name}/EMail`);
                expand.push(lookupField.Name);
            }
            else {
                if (select.indexOf(formField.Name) === -1) {
                    select.push(formField.Name);
                }
            }
        }
        return await item.select(...select).expand(...expand).get();
    }

    public set_Mode(mode: FormMode) {
        this.setState({ mode: mode });
    }

    public async validate(disableEvents?: boolean) {
        this._isValid = true;
        if (this._formFields instanceof Array) {
            for (const formField of this._formFields) {
                const result = await formField.validate(disableEvents);
                if (result && result.isValid === false) {
                    this._isValid = false;
                }
            }
        }
    }

    public get isValid(): boolean {
        if (this._formFields instanceof Array) {
            for (const formField of this._formFields) {
                if (formField && formField.isValid === false) {
                    return false;
                }
            }
        }
        return true;
    }

    public get isDirty(): boolean {
        if (this._formFields instanceof Array) {
            for (const formField of this._formFields) {
                if (formField && formField.isDirty === true) {
                    return true;
                }
            }
        }
        return false;
    }
}