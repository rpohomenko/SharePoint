import * as React from 'react';
import styles from './searchform.module.scss';
import { ISearchFormProps, ISearchFormState } from './ISearchFormProps';
import moment from 'moment';
import { IRegionalSettingsInfo } from '@pnp/sp/regional-settings';
import SPService from '../../utilities/SPService';
import ErrorBoundary from '../ErrorBoundary';
import '../../utilities/StringExtensions';
import { isEqual } from '@microsoft/sp-lodash-subset';
import { SearchField } from './SearchField';
import { FilterType, IFilterGroup, FilterJoin, IFilter } from '../../utilities/Entities';

export class SearchForm extends React.Component<ISearchFormProps, ISearchFormState> {
    private _searchFields: SearchField[];
    private _isValid: boolean;
    private _isMounted: boolean;
    private _regionalSettings: IRegionalSettingsInfo;

    constructor(props: ISearchFormProps) {
        super(props);

        this.state = {
        };
    }

    public async componentDidMount() {
        if (!this._isMounted) {
            if (this.props.regionalSettings) {
                this._regionalSettings = this.props.regionalSettings;
            }
            if (this._regionalSettings) {
                const locale = SPService.getLocaleName(this._regionalSettings.LocaleId);
                moment.locale(locale);
            }
        }
        this._isMounted = true;
    }

    public componentWillUnmount() {
        if (this._searchFields) {
            this._searchFields = undefined;
        }
        this._isMounted = false;
    }

    public async componentDidUpdate(prevProps: ISearchFormProps, prevState: ISearchFormState) {
        if (!isEqual(prevProps.regionalSettings, this.props.regionalSettings)) {
            this._regionalSettings = this.props.regionalSettings;
            if (this._regionalSettings) {
                const locale = SPService.getLocaleName(this._regionalSettings.LocaleId);
                moment.locale(locale);
            }
        }
    }

    public render() {
        const { fields, filter, onChange } = this.props;
        this._searchFields = [];
        const visibleFields = fields instanceof Array && fields.length > 0
            ? fields.filter(field => field.Filterable === true && SPService.is_Filterable(field.DataType) && !field.PrimaryFieldName)
            : null;
        if (visibleFields instanceof Array) {
            const ff = filter ? this.getFilters(filter) : null;
            return <ErrorBoundary>
                <div className={styles.searchform}>
                    <div style={{ marginTop: 5 }}>
                        {visibleFields instanceof Array && visibleFields.length > 0
                            && visibleFields.map(field => {
                                field.DefaultValue = null;
                                const fff = ff ? ff[field.Name] : null;
                                return <SearchField key={field.Id || field.Name}
                                    disabled={false}
                                    defaultValue={fff ? fff.Value : null}
                                    ref={ref => {
                                        if (ref != null) {
                                            this._searchFields.push(ref);
                                        }
                                    }}
                                    field={field}
                                    filterType={fff ? fff.Type : FilterType.Equals}
                                    regionalSettings={this.props.regionalSettings}
                                    timeZone={this.props.timeZone}
                                    onValidate={(result) => {

                                    }}
                                    onGetFieldRenderer={(ref, defaultRenderer) => {
                                        return defaultRenderer();
                                    }}
                                    onChange={(f) => {
                                        const filters = this._searchFields instanceof Array
                                            ? this._searchFields.map(searchField => searchField.get_Filter())
                                                .filter(ffff => ffff !== null)
                                            : [];
                                        f = SPService.get_FilterGroup(this.props.filterJoin === undefined ? FilterJoin.And : this.props.filterJoin, ...filters);
                                        if (onChange instanceof Function) {
                                            onChange(f);
                                        }
                                    }} />;
                            }
                            )}
                    </div>
                </div>
            </ErrorBoundary>;
        }
        return null;
    }

    private getFilters(filter: IFilterGroup): Record<string, IFilter> {
        const values: Record<string, IFilter> = {};
        if (filter) {
            if (filter.LeftFilter) {
                values[filter.LeftFilter.Field] = filter.LeftFilter;
            }
            if (filter.RightFilter) {
                values[filter.RightFilter.Field] = filter.RightFilter;
            }
            if (filter.LeftFilterGroup) {
                const leftFilterValues = this.getFilters(filter.LeftFilterGroup);
                for (const key in leftFilterValues) {
                    values[key] = leftFilterValues[key];
                }
            }
            if (filter.RightFilterGroup) {
                const rightFilterValues = this.getFilters(filter.RightFilterGroup);
                for (const key in rightFilterValues) {
                    values[key] = rightFilterValues[key];
                }
            }
        }
        return values;
    }

    public async search(): Promise<any> {
        await this.validate(true);
        if (this.isValid && this.isDirty) {

        }
    }

    public async validate(disableEvents?: boolean) {
        this._isValid = true;
        if (this._searchFields instanceof Array) {
            for (const searchField of this._searchFields) {
                const result = await searchField.validate(disableEvents);
                if (result && result.isValid === false) {
                    this._isValid = false;
                }
            }
        }
    }

    public get isValid(): boolean {
        if (this._searchFields instanceof Array) {
            for (const searchField of this._searchFields) {
                if (searchField && searchField.isValid === false) {
                    return false;
                }
            }
        }
        return true;
    }

    public get isDirty(): boolean {
        if (this._searchFields instanceof Array) {
            for (const searchField of this._searchFields) {
                if (searchField && searchField.isDirty === true) {
                    return true;
                }
            }
        }
        return false;
    }

    public clear() {
        if (this._searchFields instanceof Array) {
            for (const searchField of this._searchFields) {
                if (searchField) {
                    searchField.clear();
                }
            }
        }
    }
}