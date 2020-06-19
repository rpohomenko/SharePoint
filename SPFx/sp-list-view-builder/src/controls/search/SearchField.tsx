import * as React from 'react';
import { FormMode, IFilter, FilterType, DataType, IUrlFieldValue, ILookupFieldValue, IUserFieldValue, IFilterGroup, FilterJoin, IContentType } from '../../utilities/Entities';
import { ISearchFieldProps, ISearchFieldState } from './ISearchFieldProps';
import { FormField } from '../form/FormField';
import { IValidationResult } from '../form/fieldRenderer/IBaseFieldRendererProps';
import SPService from '../../utilities/SPService';
import { Dropdown, Stack, IDropdownOption } from 'office-ui-fabric-react';

export class SearchField extends React.Component<ISearchFieldProps, ISearchFieldState> {

    private _formField: React.RefObject<FormField>;

    constructor(props: ISearchFieldProps) {
        super(props);

        this.state = {
            filterType: this.props.filterType
        };

        this._formField = React.createRef();
    }

    public componentDidMount() {
    }

    public componentDidUpdate(prevProps: ISearchFieldProps, prevState: ISearchFieldState) {
        if (prevProps.filterType !== this.props.filterType) {
            this.setState({ filterType: this.props.filterType });
        }
    }

    public componentWillUnmount() {

    }

    public render() {
        const { field, list, defaultValue, disabled, regionalSettings, timeZone, onChange, onGetFieldRenderer, onValidate } = this.props;
        const { filterType } = this.state;

        const options: IDropdownOption[] = this.getOptions();

        return field && <FormField ref={this._formField}
            label={null}
            field={field}
            list={list}
            mode={FormMode.New}
            disabled={disabled}
            regionalSettings={regionalSettings}
            timeZone={timeZone}
            defaultValue={defaultValue}
            onGetFieldRenderer={((ref, defaultRenderer) => {
                const fieldRenderer = onGetFieldRenderer(ref, defaultRenderer);
                return fieldRenderer && <Stack horizontal>
                    <Dropdown
                        styles={{ root: { marginRight: 2 } }}
                        className="filter-type"
                        placeholder={"Select a filter..."}
                        selectedKey={filterType}
                        dropdownWidth={50}
                        onChange={(ev, item) => {
                            if (item) {
                                this.setState({ filterType: item.key as FilterType }, () => {
                                    if (this.isDirty /*&& this.isValid*/) {
                                        const filter = this.get_Filter();
                                        if (onChange instanceof Function) {
                                            onChange(filter);
                                        }
                                    }
                                });
                            }
                        }}
                        options={options}
                    />
                    {filterType !== FilterType.Empty && filterType !== FilterType.NotEmpty && fieldRenderer}
                </Stack>;
            })}
            onValidate={onValidate}
            onChange={(value: any, isDirty: boolean) => {
                let filter = null;
                //if (isDirty /*&& this.isValid*/) {
                filter = this.get_Filter();
                if (onChange instanceof Function) {
                    onChange(filter);
                }
                //}
            }} />;
    }

    private getOptions(): IDropdownOption[] {
        const { field } = this.props;
        const options: IDropdownOption[] = [
            { key: FilterType.Equals, title: "Equal to", text: "=" },
            { key: FilterType.NotEquals, title: "Not equal to", text: "≠" }
        ];

        switch (field.DataType) {
            case DataType.Text:
            case DataType.URL:
                options.push({ key: FilterType.StartsWith, title: "Starts with", text: "^" });
                options.push({ key: FilterType.Contains, title: "Contains", text: "~" });
                break;
            case DataType.Boolean:
                break;
            case DataType.Date:
            case DataType.DateTime:
            case DataType.Number:
                options.push({ key: FilterType.Less, title: "Less than", text: "<" });
                options.push({ key: FilterType.LessOrEquals, title: "Less than or equal to", text: "≤" });
                options.push({ key: FilterType.Greater, title: "Greater than", text: ">" });
                options.push({ key: FilterType.GreaterOrEquals, title: "Greater than or equal to", text: "≥" });
                break;
            case DataType.Lookup:
            case DataType.MultiLookup:
            case DataType.User:
            case DataType.MultiUser:
            case DataType.Choice:
            case DataType.MultiChoice:
                break;
            default:
                break;
        }
        options.push({ key: FilterType.Empty, title: "Empty", text: "∅" });
        options.push({ key: FilterType.NotEmpty, title: "Not empty", text: "≠∅" });
        return options;
    }

    public async validate(disableEvents?: boolean): Promise<IValidationResult> {
        if (this._formField.current) {
            return await this._formField.current.validate(disableEvents);
        }
    }

    public get isValid(): boolean {
        const { filterType } = this.state;
        if (filterType === FilterType.Empty || filterType === FilterType.NotEmpty) {
            return true;
        }
        if (this._formField.current) {
            return this._formField.current.isValid;
        }
    }

    public get isDirty(): boolean {
        const { filterType } = this.state;
        if (filterType === FilterType.Empty || filterType === FilterType.NotEmpty) {
            return true;
        }
        if (this._formField.current) {
            return this._formField.current.isDirty;
        }
    }

    public get_Filter(): IFilter | IFilterGroup {
        const { field } = this.props;
        const { filterType } = this.state;

        if (!this.isDirty || !this.isValid) return null;

        if (field && this._formField.current) {
            const value = this._formField.current.value;
            const filter: IFilter = {
                Field: this._formField.current.name,
                Type: filterType || FilterType.Equals,
                Value: value
            };

            if (filter.Field === "ContentType") {
                filter.Field = "ContentTypeId";
                filter.FilterValue = value ? `'${(value as IContentType).Id}'` : null;
            }
            else {
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
                                        //Value: lookupValue,
                                        FilterValue: String(lookupValue.Id)
                                    } as IFilter;
                                });
                                const filterGroup = SPService.get_FilterGroup(
                                    filterType === FilterType.NotEquals || filterType === FilterType.NotEmpty ? FilterJoin.And : FilterJoin.Or, ...filters);
                                return filterGroup;
                            }
                        }
                        break;
                    case DataType.User:
                    case DataType.MultiUser:
                        if ((value instanceof Array && value.length > 0)) {
                            const userValues = (value as IUserFieldValue[]).filter(v => /*v.Name*/ v.Id > 0);
                            if (userValues.length === 1) {
                                filter.FilterValue = `${userValues[0].Id}`;  //`'${userValues[0].Name}'`;
                            }
                            else if (userValues.length > 1) {
                                const filters = userValues.map(userValue => {
                                    return {
                                        ...filter,
                                        //Value: userValue,
                                        FilterValue: `${userValue.Id}`//`'${userValue.Name}'`
                                    } as IFilter;
                                });
                                const filterGroup = SPService.get_FilterGroup(
                                    filterType === FilterType.NotEquals || filterType === FilterType.NotEmpty ? FilterJoin.And : FilterJoin.Or, ...filters);
                                return filterGroup;
                            }
                        }
                        break;
                    case DataType.Choice:
                    case DataType.MultiChoice:
                        if ((value instanceof Array && value.length > 0)) {
                            const choices = value as string[];
                            if (choices.length === 1) {
                                filter.FilterValue = `'${choices[0]}'`;
                            }
                            else if (choices.length > 1) {
                                const filters = choices.map(choice => {
                                    return {
                                        ...filter,
                                        //Value: choice,
                                        FilterValue: `'${choice}'`
                                    } as IFilter;
                                });
                                const filterGroup = SPService.get_FilterGroup(
                                    filterType === FilterType.NotEquals || filterType === FilterType.NotEmpty ? FilterJoin.And : FilterJoin.Or, ...filters);
                                return filterGroup;
                            }
                        }
                        break;
                    case DataType.Number:
                        filter.FilterValue = `${value}`;
                        break;
                    default:
                        break;
                }
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