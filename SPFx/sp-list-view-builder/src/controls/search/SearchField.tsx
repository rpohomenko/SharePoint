import * as React from 'react';
import { FormMode, IFilter, FilterType, DataType, IUrlFieldValue, ILookupFieldValue, IUserFieldValue, IFilterGroup, FilterJoin } from '../../utilities/Entities';
import { ISearchFieldProps, ISearchFieldState } from './ISearchFieldProps';
import { FormField } from '../form/FormField';
import { IValidationResult } from '../form/fieldRenderer/IBaseFieldRendererProps';
import SPService from '../../utilities/SPService';

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
        const f = field ? { ...field } : null;
        if (f) {
            //f.DefaultValue = null;
            f.Required = false;
            if (f.DataType === DataType.Lookup) {
                f.DataType = DataType.MultiLookup;
            }
            else if (f.DataType === DataType.User) {
                f.DataType = DataType.MultiUser;
            }
            else if (f.DataType === DataType.Choice) {
                f.DataType = DataType.MultiChoice;
            }
        }
        return f && <FormField ref={this._formField}
            label={null}
            field={f}
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

    public get_Filter(): IFilter | IFilterGroup {
        const { field, filterType } = this.props;

        if (!this.isDirty || !this.isValid) return null;

        if (field && this._formField.current) {
            const value = this._formField.current.value;
            const filter: IFilter = {
                Field: this._formField.current.name,
                Type: filterType || FilterType.Equals,
                Value: value
            };

            switch (field.DataType) {
                case DataType.Text:
                    filter.FilterValue = `'${value}'`;
                    break;
                case DataType.Boolean:
                    filter.FilterValue = value === true ? "1" : "0";
                    break;
                case DataType.Date:
                    filter.FilterValue = `'${value}'`;
                    break;
                case DataType.DateTime:
                    filter.FilterValue = `datetime'${value}'`;
                    break;
                case DataType.URL:
                    filter.FilterValue = !value ? null : (value as IUrlFieldValue).Url;
                    break;
                case DataType.Lookup:                   
                case DataType.MultiLookup:
                    if ((value instanceof Array && value.length > 0)) {
                        const lookupValues = (value as ILookupFieldValue[]).filter(v => v.Id > 0);
                        if (lookupValues.length === 1) {
                            filter.FilterValue = String(lookupValues[0].Id);
                        }
                        else if (lookupValues.length > 1) {
                            const filters = lookupValues.map(lookupValue => {
                                return {
                                    ...filter,
                                    Value: lookupValue,
                                    FilterValue: String(lookupValue.Id)
                                } as IFilter;
                            });
                            const filterGroup = SPService.get_FilterGroup(FilterJoin.Or, ...filters);
                            return filterGroup;
                        }
                    }
                    break;
                case DataType.User:
                case DataType.MultiUser:
                    //filter.FilterValue = !(value instanceof Array && value.length > 0) ? null : (value as IUserFieldValue[]).map(v => `'${v.Name}'`);
                    break;
                case DataType.Choice:
                case DataType.MultiChoice:
                    //filter.FilterValue = !(value instanceof Array && value.length > 0) ? null : `${value as string[]}`;
                    break;
                case DataType.Number:
                    filter.FilterValue = `${value}`;
                    break;
                default:
                    break;
            }

            if (filterType === FilterType.Equals || filterType === FilterType.NotEquals) {
                if (filter.Value === "" || filter.Value === null || (filter.Value instanceof Array && filter.Value.length === 0)) {
                    filter.Value = null;
                    filter.FilterValue = null;
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