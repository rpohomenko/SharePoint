import * as React from 'react';
import { IListFormProps, IListFormState } from './IListFormProps';
import { FormField } from './FormField';
import { FormMode, IListItem } from '../../utilities/Entities';
import { cancelable, CancelablePromise } from 'cancelable-promise';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { IList } from '@pnp/sp/lists';
import { IItemAddResult, IItem } from '@pnp/sp/items';

interface CancelablePromise {
    cancel: () => void;
}

export class ListForm extends React.Component<IListFormProps, IListFormState> {

    private _formFields: FormField[];
    private _promise: CancelablePromise;
    private _itemChanges: IListItem;
    private _isValid: boolean;

    constructor(props: IListFormProps) {
        super(props);

        this.state = {
            mode: props.mode,
            item: null
        };
    }

    public async componentDidMount() {
        const { itemPromise } = this.props;
        if (itemPromise) {
            this.setState({
                isLoading: true
            });
            this._promise = cancelable(itemPromise).finally(() => {
                this.setState({
                    isLoading: false
                });
            });
            const item = await itemPromise;
            this._promise = undefined;
            this.setState({
                item: item
            });
        }
    }

    public componentWillUnmount() {
        if (this._promise) {
            this._promise.cancel();
        }
    }

    public componentDidUpdate(prevProps: IListFormProps, prevState: IListFormState) {
        if (prevProps.mode != this.props.mode) {
            this.setState({ mode: this.props.mode });
        }
    }

    public render() {
        const { fields, onChange } = this.props;
        const { mode, item, isLoading, isSaving, error } = this.state;

        this._formFields = [];
        return <div className="list-form">
            {isLoading && <ProgressIndicator label="Loading..." />}
            {isSaving && <ProgressIndicator label="Saving..." />}
            {error && <span style={{
                color: 'red',
                display: 'block',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
            }}>{error}</span>}
            {fields instanceof Array && fields.length > 0
                && fields.map(field => <FormField key={field.Id || field.Name}
                    disabled={isLoading || isSaving}
                    defaultValue={item ? item[field.Name] : undefined}
                    ref={ref => {
                        if (ref != null) {
                            this._formFields.push(ref);
                        }
                    }}
                    field={field} mode={mode}
                    onValidate={(result) => {

                    }}
                    onChange={(value) => {
                        const item: IListItem = this._itemChanges || {} as IListItem;
                        item[field.Name] = value;
                        this._itemChanges = item;
                        if (onChange instanceof Function) {
                            onChange(field, value);
                        }
                    }} />)}
        </div>;
    }

    public async save(list: IList): Promise<IItem> {
        const { mode, item } = this.state;
        if (list && this._itemChanges) {
            if (mode === FormMode.New) {
                await this.validate(true);
                if (this.isValid && this.isDirty) {
                    this.setState({ isSaving: true, error: undefined });
                    const result = await cancelable(list.items.add(this._itemChanges))
                        .catch((error) => {
                            this.setState({ error: error.message });
                        })
                        .finally(() => {
                            this.setState({ isSaving: false });
                        });
                    if (result) {
                        this._itemChanges = undefined;
                        return result.item;
                    }
                }
            }
            else if (mode === FormMode.Edit) {
                await this.validate(true);
                if (this.isValid && this.isDirty) {
                    this.setState({ isSaving: true, error: undefined });
                    const result = await cancelable(list.items.getById(item.ID).update({
                        ...this._itemChanges,
                        "owshiddenversion": item["owshiddenversion"]
                    }))
                        .catch((error) => {
                            this.setState({ error: error.message });
                        })
                        .finally(() => {
                            this.setState({ isSaving: false });
                        });
                    if (result) {
                        this._itemChanges = undefined;
                        return result.item;
                    }
                }
            }
        }
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
                if (formField.isValid === false) {
                    return false;
                }
            }
        }
        return true;
    }

    public get isDirty(): boolean {
        if (this._formFields instanceof Array) {
            for (const formField of this._formFields) {
                if (formField.isDirty === true) {
                    return true;
                }
            }
        }
        return false;
    }
}