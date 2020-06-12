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
        const { fields, onChange } = this.props;
        this._searchFields = [];
        const visibleFields = fields instanceof Array && fields.length > 0
            ? fields.filter(field => field.Filterable === true && SPService.is_Filterable(field.DataType) && !field.PrimaryFieldName)
            : null;
        /*if (visibleFields) {
            visibleFields.forEach(field => {
                field.DefaultValue = null;
            });
        }*/
        return <ErrorBoundary>
            <div className={styles.searchform}>
                <div style={{ marginTop: 5 }}>
                    {visibleFields instanceof Array && visibleFields.length > 0
                        && visibleFields.map(field =>
                            <SearchField key={field.Id || field.Name}
                                disabled={false}
                                defaultValue={undefined}
                                ref={ref => {
                                    if (ref != null) {
                                        this._searchFields.push(ref);
                                    }
                                }}
                                field={field}
                                filterType={FilterType.Equals}
                                regionalSettings={this.props.regionalSettings}
                                timeZone={this.props.timeZone}
                                onValidate={(result) => {

                                }}
                                onGetFieldRenderer={(ref, defaultRenderer) => {
                                    return defaultRenderer();
                                }}
                                onChange={(filter) => {
                                    const filters = this._searchFields instanceof Array
                                        ? this._searchFields.filter(searchField => !isEqual(searchField.props.field, field)).map(searchField => searchField.get_Filter())
                                            .filter(f => f !== null)
                                        : null;
                                    filter = this.get_Filter(filter as IFilter, filters, this.props.filterJoin === undefined ? FilterJoin.And : this.props.filterJoin);
                                    if (onChange instanceof Function) {
                                        onChange(filter);
                                    }
                                }} />
                        )}
                </div>
            </div>
        </ErrorBoundary>;
    }

    private get_Filter(rightFilter: IFilter, filters: IFilter[], filterJoin?: FilterJoin): IFilterGroup {
        if (!rightFilter && !(filters instanceof Array && filters.length > 0)) return null;

        if (!filterJoin) {
            filterJoin = this.props.filterJoin === undefined ? FilterJoin.And : this.props.filterJoin;
        }

        let leftFilter: IFilter;
        let leftFilterGroup: IFilterGroup;

        do {
            leftFilter = filters instanceof Array && filters.length > 0 ? filters[0] : null;
            filters = filters.slice(1);
            if (leftFilter !== null) {
                leftFilterGroup = filters.length > 0 ? this.get_Filter(leftFilter, filters, filterJoin) : null;
            }
        }
        while (leftFilter === null && filters.length > 0);

        if (rightFilter === null) {
            return leftFilterGroup || {
                RightFilter: leftFilter
            } as IFilterGroup;
        }

        if (leftFilterGroup && !leftFilterGroup.LeftFilter && !leftFilterGroup.LeftFilterGroup) {
            leftFilterGroup = null;
        }

        const filterGroup: IFilterGroup = {
            LeftFilter: !!leftFilterGroup ? null : leftFilter,
            LeftFilterGroup: leftFilterGroup,
            Join: filterJoin,
            RightFilter: rightFilter
        };
        return filterGroup;
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

    public clear(){
        if (this._searchFields instanceof Array) {
            for (const searchField of this._searchFields) {
                if (searchField) {
                    searchField.clear();
                }
            }
        }
    }
}