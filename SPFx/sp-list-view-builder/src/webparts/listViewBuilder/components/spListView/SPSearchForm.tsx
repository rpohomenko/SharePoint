import * as React from 'react';
import { isEqual } from '@microsoft/sp-lodash-subset';
import { ITimeZoneInfo, IRegionalSettingsInfo } from "@pnp/sp/regional-settings/types";
import { IFormField, IFilterGroup } from '../../../../utilities/Entities';
import { SPListView } from '../spListView';
import { PrimaryButton, DefaultButton, ProgressIndicator, Panel, CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { SearchForm } from '../../../../controls/search/SearchForm';
import { cancelable } from 'cancelable-promise';

export interface ISPSearchFormProps {
    fields: IFormField[];
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
    headerText: string;
    isOpen?: boolean;
    listView: SPListView;
    filter?: IFilterGroup;
}

export interface ISPSearchFormState {
    isOpen?: boolean;
    isSearching?: boolean;
    searchCommandEnabled?: boolean;
    filter?: IFilterGroup;
}

export class SPSearchForm extends React.Component<ISPSearchFormProps, ISPSearchFormState> {
    private _searchForm: React.RefObject<SearchForm>;
    private _onClose?: () => void;

    constructor(props: ISPSearchFormProps) {
        super(props);

        // Initialize state
        this.state = {
            isOpen: this.props.isOpen,
            filter: this.props.filter ? { ...this.props.filter } : null
        };

        this._searchForm = React.createRef();
    }

    public async componentDidMount() {

    }

    public async componentDidUpdate(prevProps: ISPSearchFormProps, prevState: ISPSearchFormState) {
        if (!isEqual(prevProps.isOpen, this.props.isOpen)) {
            this.setState({ isOpen: this.props.isOpen });
        }
        if (!isEqual(prevProps.filter, this.props.filter)) {
            this.setState({ filter: this.props.filter ? { ...this.props.filter } : null });
        }
    }

    public componentWillUnmount() {

    }

    public render(): React.ReactElement {
        let { fields } = this.props;
        const { headerText, regionalSettings, timeZone } = this.props;
        const { isOpen, isSearching, filter } = this.state;
        if (isOpen === true) {
            if (fields instanceof Array) {
                fields = [...fields];
                if (filter) {
                    const defaultValues = this.getFilterValues(filter);
                    for (const field of fields) {
                        field.DefaultValue = defaultValues[field.Name];
                    }
                }
                else{
                    for (const field of fields) {
                        field.DefaultValue = null;
                    }
                }
            }
            return <Panel isLightDismiss isOpen={isOpen === true}
                onLightDismissClick={() => {
                    if (this._searchForm.current && this._searchForm.current.isDirty) {
                        return;
                    }
                    this.close();
                }} onDismiss={() => {
                    this.close();
                }} closeButtonAriaLabel={"Close"}
                headerText={`${headerText ? headerText + ": " : ""}${"Filter"}`}
                onRenderFooterContent={this.renderFooterContent.bind(this)}
                isFooterAtBottom={false}>
                <CommandBar items={this.getCommandItems()}
                    farItems={this.getFarCommandItems()} />
                {<SearchForm ref={this._searchForm}
                    regionalSettings={regionalSettings}
                    timeZone={timeZone}
                    fields={fields}
                    onChange={this.onFilterChange.bind(this)} />}
            </Panel>;
        }
        return null;
    }

    private getFilterValues(filter: IFilterGroup): Record<string, any> {
        const values: Record<string, any> = {};
        if (filter) {
            if (filter.LeftFilter) {
                values[filter.LeftFilter.Field] = filter.LeftFilter.Value;
            }
            if (filter.RightFilter) {
                values[filter.RightFilter.Field] = filter.RightFilter.Value;
            }
            if (filter.LeftFilterGroup) {
                const leftFilterValues = this.getFilterValues(filter.LeftFilterGroup);
                for (const key in leftFilterValues) {
                    values[key] = leftFilterValues[key];
                }
            }
            if (filter.RightFilterGroup) {
                const rightFilterValues = this.getFilterValues(filter.RightFilterGroup);
                for (const key in rightFilterValues) {
                    values[key] = rightFilterValues[key];
                }
            }
        }
        return values;
    }

    protected onFilterChange(filter: IFilterGroup) {
        if (this._searchForm.current) {
            const { isSearching } = this.state;
            const isValid = this._searchForm.current.isValid;
            const isDirty = this._searchForm.current.isDirty;
            if (isDirty) {
                this.setState({ filter: filter, searchCommandEnabled: true }, () => {
                    //this.search();
                });
            }
        }
    }

    private renderFooterContent = () => {
        const { searchCommandEnabled, filter } = this.state;
        return (<div>
            <PrimaryButton disabled={!searchCommandEnabled || !filter} onClick={() => {
                this.search();
            }} styles={{ root: { marginRight: 8 } }}>
                {"Filter"}
            </PrimaryButton>
            <DefaultButton onClick={() => this.close()}>{"Cancel"}</DefaultButton>
        </div>);
    }

    protected getFarCommandItems(): ICommandBarItemProps[] {
        const { searchCommandEnabled, isSearching, filter } = this.state;
        const items: ICommandBarItemProps[] = [];
        if (!!filter) {
            items.push({
                key: 'clearfilter', text: 'Clear Filter', iconProps: { iconName: 'ClearFilter' }, iconOnly: true,
                disabled: !searchCommandEnabled || isSearching === true,
                onClick: () => {
                    this.clear();
                }
            });
        }
        return items;
    }

    public clear() {
        const { listView } = this.props;
        this.setState({ filter: undefined }, () => {
            if (this._searchForm.current) {
                this._searchForm.current.clear();
            }
            if (listView && listView.state.filter) {
                this.search();
            }
        });
    }

    protected getCommandItems(): ICommandBarItemProps[] {
        const { searchCommandEnabled, isSearching, filter } = this.state;
        const items: ICommandBarItemProps[] = [];

        items.push({
            key: 'filter', text: 'Filter', iconProps: { iconName: 'Filter' }, iconOnly: true,
            disabled: !searchCommandEnabled || isSearching === true || !filter,
            onClick: () => {
                this.search();
            }
        });

        return items;
    }

    private search() {
        const { listView } = this.props;
        const { filter } = this.state;
        if (listView) {
            this.setState({ searchCommandEnabled: false, isSearching: true });
            cancelable(listView.search(filter)).then(() => {
                //this.close();                   
            })
                .catch(() => {

                })
                .finally(() => {
                    this.setState({ searchCommandEnabled: true, isSearching: false });
                });
        }
    }

    public open(onClose?: () => void, filter?: IFilterGroup) {
        this.setState({ isOpen: true });
        if(filter){
            this.setState({ filter: filter });
        }
        if (onClose instanceof Function) {
            this._onClose = onClose;
        }
    }

    public close() {
        const onClose = this._onClose;
        this.setState({ isOpen: false, filter: null }, () => {
            if (onClose instanceof Function) {
                onClose();
            }
        });
    }
}