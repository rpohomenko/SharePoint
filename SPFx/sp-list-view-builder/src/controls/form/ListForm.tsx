import * as React from 'react';
import styles from './listform.module.scss';
import { IListFormProps, IListFormState } from './IListFormProps';
import { FormField } from './FormField';
import { FormMode, IListItem, IFormField, DataType, IUserFieldValue, ILookupFieldValue } from '../../utilities/Entities';
import { cancelable, CancelablePromise } from 'cancelable-promise';
import { ProgressIndicator } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { IItem } from '@pnp/sp/items';
import { IListItemFormUpdateValue, IList } from '@pnp/sp/lists';
import moment from 'moment';
import { IRegionalSettingsInfo } from '@pnp/sp/regional-settings';
import SPService from '../../utilities/SPService';
import { IValidationResult } from './fieldRenderer/IBaseFieldRendererProps';
import ErrorBoundary from '../ErrorBoundary';
import '../../utilities/StringExtensions';

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
        if (!this._isMounted) {
            if (this.props.regionalSettings) {
                this._regionalSettings = await this.props.regionalSettings;
            }
            if (this._regionalSettings) {
                const locale = SPService.getLocaleName(this._regionalSettings.LocaleId);
                moment.locale(locale);
            }
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
            if (this.state.mode === FormMode.Edit || this.state.mode === FormMode.Display && this.props.itemId > 0) {
                await this.loadItem();
            }
        }
    }

    public loadItem(): Promise<IListItem> {
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
                this.setState({ isLoading: true, error: undefined });
                this._promise = cancelable(this.getItem(spItem)
                    .then(item => {
                        if (item) {
                            this.setState({ item: item }, () => {
                                if (this.props.onItemLoaded instanceof Function) {
                                    this.props.onItemLoaded(item);
                                }
                            });
                            return item;
                        }
                    })
                    .catch(error => {
                        this.setState({ error: error });
                    })).finally(() => {
                        this._promise = null;
                        this.setState({ isLoading: false });
                    });

                return this._promise;
            }
        }
        else {
            //this.setState({ item: null });
        }
    }

    public render() {
        const { list, fields, onChange } = this.props;
        const { mode, item, isLoading, isSaving, error } = this.state;
        this._formFields = [];
        const visibleFields = fields instanceof Array && fields.length > 0
            ? fields.filter(f => !(f.Modes instanceof Array) || f.Modes.length === 0 || f.Modes.indexOf(mode) !== -1)
            : null;
        return <ErrorBoundary>
            <div className={styles.listform}>
                {isLoading && <ProgressIndicator label="Loading..." />}
                <div style={{ marginTop: 5 }}>
                    {!isLoading && visibleFields instanceof Array && visibleFields.length > 0
                        && visibleFields.map(field => <FormField key={field.Id || field.Name}
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
                {isSaving && <ProgressIndicator label="Saving..." />}
                {error && <span style={{
                    color: 'red',
                    display: 'block',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                }}>{error}</span>}
            </div>
        </ErrorBoundary>;
    }

    private _addItem(list: IList, item: IListItem): Promise<IItem> {
        for (const fName in item) {
            const fields = this.props.fields.filter(f => f.Name === fName);
            if (fields.length > 0) {
                const field = fields[0];
                const value = this.getFieldValue(field, item, FormMode.New);
                if (field.DataType === DataType.Lookup
                    || field.DataType === DataType.MultiLookup
                    || field.DataType === DataType.User
                    || field.DataType === DataType.MultiUser) {
                    item[`${field.Name}Id`] = value;
                    delete item[field.Name];
                }
                else {
                    item[field.Name] = value;
                }
            }
        }

        this.setState({ isSaving: true, error: undefined });
        this._promise = cancelable(list.items.add(item)
            .then((result) => {
                if (result) {
                    return result.item;
                }
                return null;
            })
            .catch((error) => {
                this.setState({ error: error.message });
            }))
            .finally(() => {
                this._promise = null;
                this.setState({ isSaving: false });
            });
        return this._promise;
    }

    private _updateItem(list: IList, itemId: number, item: IListItem, itemVersion: number): Promise<IItem> {

        const formUpdateValues: IListItemFormUpdateValue[] = [];
        for (const fName in item) {
            const fields = this.props.fields.filter(f => f.Name === fName);
            if (fields.length > 0) {
                const field = fields[0];
                formUpdateValues.push({
                    FieldName: field.Name.removePrefix("OData_"),
                    FieldValue: this.getFieldValue(field, item, FormMode.Edit)
                });
            }
        }
        if (itemVersion > 0) {
            formUpdateValues.push({ FieldName: "owshiddenversion", FieldValue: String(itemVersion) });
        }

        this.setState({ isSaving: true, error: undefined });
        this._promise = cancelable(list.items.getById(itemId).validateUpdateListItem(formUpdateValues, false).then(formValues => {
            formValues = (formValues as any).ValidateUpdateListItem ? (formValues as any).ValidateUpdateListItem.results : formValues;
            const errors = formValues.filter(field => field.HasException === true);
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
                return null;
            }
            else {
                return list.items.getById(itemId);
            }
        }).catch((error) => {
            this.setState({ error: error.message });
        })).finally(() => {
            this._promise = null;
            this.setState({ isSaving: false });
        });
        return this._promise;
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
            await this.validate(true);
            if (this.isValid && this.isDirty) {
                const changes = {/*...item,*/ ...this._itemChanges };
                const spItem = await (mode === FormMode.New
                    ? this._addItem(list, changes)
                    : this._updateItem(list, item ? item.ID : itemId, changes, item ? item["owshiddenversion"] : 0));
                if (spItem) {
                    this._itemChanges = undefined;
                    this.setState({ isLoading: true });
                    this._promise = cancelable(this.getItem(spItem).catch((error) => {
                        this.setState({ error: error.message });
                    })).finally(() => {
                        this._promise = null;
                        this.setState({ isLoading: false });
                    });
                    const savedItem = await this._promise;
                    if (savedItem) {
                        this.setState({ item: savedItem, mode: FormMode.Edit });
                    }
                    return savedItem;
                }
                else {
                    if (mode === FormMode.New) {
                        throw "Error on item adding!";
                    }
                    else {
                        throw "Error on item updating!";
                    }
                }
            }
        }
    }

    private getFieldValue(field: IFormField, item: any, mode: FormMode) {
        if (field && item) {
            let value = item[field.Name];
            switch (field.DataType) {
                case DataType.Date:
                case DataType.DateTime:
                    if (mode === FormMode.Edit) {
                        value = value ? moment(new Date(value)).format("L LT") : null;
                    }
                    break;
                case DataType.Boolean:
                    if (mode === FormMode.Edit) {
                        value = value === true ? "1" : value === false ? "0" : null;
                    }
                    break;
                case DataType.Lookup:
                    value = value
                        ? (value instanceof Array && value.length > 0
                            ? (value[0] as ILookupFieldValue).Id
                            : (value as ILookupFieldValue).Id)
                        : null;
                    if (value > 0) {
                        if (mode === FormMode.Edit) {
                            value = String(value);
                        }
                    }
                    else {
                        value = null;
                    }
                    break;
                case DataType.MultiLookup:
                    value = value && value instanceof Array && value.length > 0
                        ? { results: value.map(v => (v as ILookupFieldValue).Id) }
                        : null;
                    break;
                case DataType.User:
                    value = value
                        ? (value instanceof Array && value.length > 0
                            ? value[0]
                            : value)
                        : null;
                    if (mode === FormMode.New) {
                        if (value && (value as IUserFieldValue).Id > 0) {
                            value = (value as IUserFieldValue).Id;
                        }
                        else {
                            value = null;
                        }
                    }
                    else {
                        if (value && (value as IUserFieldValue).Name) {
                            value = JSON.stringify([{ "Key": (value as IUserFieldValue).Name }]);
                        }
                        else {
                            value = null;
                        }
                    }
                    break;
                case DataType.MultiUser:
                    value = value && value instanceof Array && value.length > 0
                        ? { results: value.map(v => (v as IUserFieldValue).Id) }
                        : null;
                    break;
            }
            return value;
        }
    }

    private getItem(item: IItem): Promise<IListItem> {
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

        return item.select(...select).expand(...expand).get();
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

    public deleteItem(itemId: number): Promise<void> {
        const { list } = this.props;
        if (list && itemId > 0) {
            this._promise = cancelable(list.items.getById(itemId).delete()
                .catch((error) => {
                    this.setState({ error: error.message });
                }));
            return this._promise;
        }
    }
}