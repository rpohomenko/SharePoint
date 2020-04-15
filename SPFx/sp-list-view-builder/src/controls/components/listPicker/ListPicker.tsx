
import * as React from 'react';
import { IDropdownOption, IDropdownProps, Dropdown } from 'office-ui-fabric-react/lib/components/Dropdown';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/components/Spinner';

import "@pnp/sp/webs";
import { IWeb } from "@pnp/sp/webs";
import "@pnp/sp/lists";
//import { IListInfo } from "@pnp/sp/lists";

import { IListPickerProps, IListPickerState, ListOrderBy, ISPListInfo } from './IListPicker';
import styles from './ListPicker.module.scss';
import { cloneDeep } from '@microsoft/sp-lodash-subset';

/**
* Empty list value, to be checked for single list selection
*/
//const EMPTY_LIST_KEY = 'NO_LIST_SELECTED';

/**
* Renders the controls for the ListPicker component
*/
export class ListPicker extends React.Component<IListPickerProps, IListPickerState> {
    private _selectedList: ISPListInfo | ISPListInfo[] = null;
    private _lists: ISPListInfo[];
    /**
    * Constructor method
    */
    constructor(props: IListPickerProps) {
        super(props);

        this.state = {
            options: [],
            loading: false
        };
    }

    /**
    * Lifecycle hook when component is mounted
    */
    public componentDidMount() {
        this.loadLists();
    }

    /**
     * componentDidUpdate lifecycle hook
     * @param prevProps
     * @param prevState
     */
    public componentDidUpdate(prevProps: IListPickerProps, prevState: IListPickerState): void {
        if (
            prevProps.baseTemplate !== this.props.baseTemplate ||
            prevProps.includeHidden !== this.props.includeHidden ||
            prevProps.orderBy !== this.props.orderBy
        ) {
            this.loadLists();
        }

        if (prevProps.selectedList !== this.props.selectedList) {
            this._selectedList = cloneDeep(this.props.selectedList);
            this.setSelectedLists();
        }
    }

    /**
    * Loads the list from SharePoint current web site
    */
    private loadLists() {
        const { web, multiSelect } = this.props;

        // Show the loading indicator and disable the dropdown
        this.setState({ loading: true });

        this.getLists(web).then((results) => {
            let options: IDropdownOption[] = [];

            // Start mapping the lists to the dropdown option
            options = results.map(list => ({
                key: list.Id,
                text: list.Title
            }));

            this._selectedList = cloneDeep(this.props.selectedList);

            /*if (!this._selectedList && multiSelect !== true) {
                // Add option to unselct list
                options.unshift({
                    key: EMPTY_LIST_KEY,
                    text: ''
                });
            }*/
           
            this.setSelectedLists();

            // Hide the loading indicator and set the dropdown options and enable the dropdown
            this.setState({
                loading: false,
                options: options
            });
        });
    }

    private getLists(web: IWeb): Promise<ISPListInfo[]> {
        this._lists = null;
        const { baseTemplate, includeHidden, orderBy, filter } = this.props;
        return new Promise<ISPListInfo[]>((resolve: (lists: ISPListInfo[]) => void, reject: (error: any) => void) => {
            try {
                let filterText = "";
                if (baseTemplate !== null && baseTemplate !== undefined) {
                    filterText = `BaseTemplate eq ${baseTemplate}`;
                }
                if (includeHidden !== null && includeHidden !== undefined) {
                    if (filterText) {
                        filterText += " and ";
                    }
                    filterText += `Hidden eq ${includeHidden}`;
                }
                if (filter) {
                    if (filterText) {
                        filterText += " and ";
                    }
                    filterText += filter;
                }

                let query = web.lists
                    .expand('RootFolder')
                    .select('Id', 'Title', 'BaseTemplate', 'RootFolder/ServerRelativeUrl', 'DefaultDisplayFormUrl');

                if (filterText) {
                    query = query.filter(filterText);
                }
                if (orderBy !== ListOrderBy.None) {
                    query = query.orderBy(orderBy === ListOrderBy.Id ? "Id" : (orderBy === ListOrderBy.Title ? "Title" : null));
                }
                return query
                    .get()
                    .then((lists) => {
                        this._lists = lists.map(list => {
                            return {
                                Id: list.Id,
                                Url: list.RootFolder.ServerRelativeUrl,
                                Title: list.Title,
                                DisplayFormUrl: list.DefaultDisplayFormUrl
                            } as ISPListInfo;
                        });
                        resolve(this._lists);
                    }).catch(e => {
                        reject(e.message);
                    });
            }
            catch (e) {
                reject(e.message);
            }
        });
    }
    /**
     * Set the currently selected list
     */
    private setSelectedLists(callback?: () => void) {        
        this.setState({
            selectedList: this._selectedList
        }, callback);
    }

    /**
    * Raises when a list has been selected
    * @param option the new selection
    * @param index the index of the selection
    */
    private onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void => {
        const { multiSelect, onSelectionChanged } = this.props;

        if (multiSelect === true) {
            // Check if option was selected
            let selectedLists = (this._selectedList ? cloneDeep(this._selectedList) : []) as ISPListInfo[];
            if (option.selected) {
                selectedLists.push(this._lists.filter(list => list.Id === option.key as string)[0]);
            } else {
                // Filter out the unselected list
                selectedLists = selectedLists.filter(list => list.Id !== option.key as string);
            }
            this._selectedList = selectedLists;
        } else {
            this._selectedList = this._lists.filter(list => list.Id === option.key as string);
            if(this._selectedList.length > 0){
                this._selectedList = this._selectedList[0];
            }
            else{
                this._selectedList = null;
            }
        }

        this.setSelectedLists(() => {
            if (onSelectionChanged instanceof Function) {
                onSelectionChanged(cloneDeep(this._selectedList));
            }
        });
    }

    /**
    * Renders the ListPicker controls with Office UI Fabric
    */
    public render(): JSX.Element {
        const { loading, options, selectedList } = this.state;
        const { className, disabled, multiSelect, label, placeHolder } = this.props;

        const dropdownOptions: IDropdownProps = {
            className: className,
            options: options,
            disabled: (loading || disabled),
            label: label,
            placeholder: placeHolder,
            onChange: this.onChange
        };

        if (multiSelect === true) {
            dropdownOptions.multiSelect = true;
            dropdownOptions.selectedKeys = selectedList instanceof Array ? (selectedList as ISPListInfo[]).map(list => list.Id) : undefined;
        } else {
            dropdownOptions.selectedKey = selectedList ? (selectedList as ISPListInfo).Id : /*EMPTY_LIST_KEY*/ undefined;
        }

        return (
            <div className={styles.listPicker}>                
                {loading && <Spinner className={styles.spinner} size={SpinnerSize.xSmall} />}
                <Dropdown {...dropdownOptions} />
            </div>
        );
    }
}