import * as React from 'react';
import { FormMode, IFilter, FilterType, DataType, IUrlFieldValue, ILookupFieldValue, IUserFieldValue } from '../../utilities/Entities';
import { ISearchFieldProps, ISearchFieldState } from './ISearchFieldProps';
import { FormField } from '../form/FormField';
import { IValidationResult } from '../form/fieldRenderer/IBaseFieldRendererProps';

export class SearchField extends React.Component<ISearchFieldProps, ISearchFieldState> {

    private _formField: React.RefObject<FormField>;

    constructor(props: ISearchFieldProps) {
        super(props);

        this.state = {

        };

        this._formField = React.createRef();
    }

    public componentDidMount() {
    }

    public componentDidUpdate(prevProps: ISearchFieldProps, prevState: ISearchFieldState) {

    }

    public componentWillUnmount() {

    }

    public render() {
        const { field, filterType, defaultValue, disabled, regionalSettings, timeZone, onChange, onGetFieldRenderer, onValidate } = this.props;
        field.DefaultValue = null
        field.Required = false;      
        return field && <FormField ref={this._formField}
            label={null}
            field={field}
            mode={FormMode.New}
            disabled={disabled}
            regionalSettings={regionalSettings}
            timeZone={timeZone}
            defaultValue={defaultValue}
            onGetFieldRenderer={onGetFieldRenderer}
            onValidate={onValidate}
            onChange={(value: any, isDirty: boolean) => {
                let filter = null;
                if (isDirty /*&& this.isValid*/) {
                    filter = this.get_Filter();
                }

                if (onChange instanceof Function) {
                    onChange(filter);
                }
            }} />;
    }

    public async validate(disableEvents?: boolean): Promise<IValidationResult> {
        if (this._formField.current) {
            return await this._formField.current.validate(disableEvents);
        }
    }

    public get isValid(): boolean {
        if (this._formField.current) {
            return this._formField.current.isValid;
        }
    }

    public get isDirty(): boolean {
        if (this._formField.current) {
            return this._formField.current.isDirty;
        }
    }

    public get_Filter(): IFilter {
        const { field, filterType } = this.props;

        if (!this.isDirty || !this.isValid) return null;

        if (field && this._formField.current) {
            const value = this._formField.current.value;
            const filter: IFilter = {
                Field: this._formField.current.name,
                Type: filterType || FilterType.Equals,
                Value: null
            };

            switch (field.DataType) {
                case DataType.Text:
                    filter.Value = `'${value}'`;
                    break;
                case DataType.Boolean:
                    filter.Value = value === true ? "1" : "0";
                    break;
                case DataType.Date:
                case DataType.DateTime:
                    filter.Value = `datetime'${value}'`;
                    break;
                case DataType.URL:
                    filter.Value = !value ? null : (value as IUrlFieldValue).Url;
                    break;
                case DataType.Lookup:
                    filter.Value = !(value instanceof Array && value.length > 0) ? null : `${(value as ILookupFieldValue[])[0].Id}`;
                    break;
                case DataType.User:
                    filter.Value = !(value instanceof Array && value.length > 0) ? null : `${(value as IUserFieldValue[])[0].Id}`;
                    break;
                case DataType.Choice:
                    filter.Value = !(value instanceof Array && value.length > 0) ? null : `${(value as string[])[0]}`;
                    break;
                case DataType.Number:
                    filter.Value = `${value}`;
                    break;
                default:
                    //filter.Value = `${value}`;
                    break;
            }

            if (filterType === FilterType.Equals || filterType === FilterType.NotEquals) {
                if (filter.Value === "" || filter.Value === null) {
                    filter.Value = null;
                    filter.Type = filterType === FilterType.Equals ? FilterType.Empty : FilterType.NotEmpty;
                }
            }

            return filter;
        }
        return null;
    }

    public clear() {
        if (this._formField.current) {
            const fieldControl = this._formField.current.renderer;
            if (fieldControl) {
                fieldControl.setValue(null);
                //fieldControl.setState({value: null});
            }
        }
    }
}