import * as React from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { PagedItemCollection } from "@pnp/sp/items";
import { isEqual } from '@microsoft/sp-lodash-subset';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { ListView, IListViewProps } from '../../../../controls/listView';
import { IViewColumn } from '../../../../controls/listView';
import { ITimeZoneInfo, IRegionalSettingsInfo } from "@pnp/sp/regional-settings/types";
import { ISPListViewProps, ISPListViewState, DataType, IViewField, IViewLookupField } from './ISPListView';
import moment from 'moment';
import SPService from '../../../../utilities/SPService';
import DateHelper from '../../../../utilities/DateHelper';

export class SPListView extends React.Component<ISPListViewProps, ISPListViewState> {

    private _timeZone: ITimeZoneInfo;
    private _regionalSettings: IRegionalSettingsInfo;

    constructor(props: ISPListViewProps) {
        super(props);

        // Initialize state
        this.state = {
            columns: []
        };
    }

    public async componentDidMount() {
        const columns = this.get_Columns(this.props.viewFields);
        this.setState({ isLoading: true, page: { results: new Array(10) } as PagedItemCollection<any[]> });
        if (this.props.regionalSettings) {
            this._regionalSettings = await this.props.regionalSettings;
        }
        if (this.props.timeZone) {
            this._timeZone = await this.props.timeZone;
        }

        const locale =  SPService.getLocaleName(this._regionalSettings.LocaleId);
        moment.locale(locale);

        const page = await this.getData();       
        this.setState({ page: page, columns: columns, isLoading: false });
    }

    public async componentDidUpdate(prevProps: ISPListViewProps, prevState: ISPListViewState) {
        if (!isEqual(prevProps, this.props)) {
           await this.componentDidMount();
        }
    }

    public componentWillUnmount(){
       
    }

    public render(): React.ReactElement {
        const { page, columns, isLoading } = this.state;
        const listView = React.createElement(ListView, {
            items: page ? page.results : [],
            columns: columns,
            onSelect: this.onSelectItems.bind(this),
            onSort: this.onSortItems.bind(this)
        } as IListViewProps);
        return <div>
            {isLoading && !page && <Spinner size={SpinnerSize.large} />}
            {listView}
        </div>;
    }

    private async getData(sortColumn?: IViewColumn): Promise<PagedItemCollection<any>> {
        let select = [], expand = [];
        for (const viewField of this.props.viewFields) {
            if (viewField.Name === "LinkTitle") {
                select.push("Title");
            }
            else if (viewField.DataType === DataType.Lookup
                || viewField.DataType === DataType.MultiLookup
            ) {
                const lookupField = viewField as IViewLookupField;
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
            else if (viewField.DataType === DataType.User
                || viewField.DataType === DataType.MultiUser
            ) {
                const lookupField = viewField as IViewLookupField;
                select.push(`${lookupField.Name}/ID`);
                select.push(`${lookupField.Name}/Name`);
                select.push(`${lookupField.Name}/EMail`);
                expand.push(lookupField.Name);
            }
            else {
                select.push(viewField.Name);
            }
        }

        let request = sp.web.lists.getById(this.props.listId).items
            .top(this.props.count || 30);

        if (select.length > 0) {
            request = request.select(...select);
        }
        if (expand.length > 0) {
            request = request.expand(...expand);
        }

        if (sortColumn) {
            request = request.orderBy(sortColumn.fieldName, sortColumn.isSortedDescending);
        }

        return await request.usingCaching().getPaged();
    }
    
    private onSelectItems(items: any[]) {

    }

    private onSortItems(column: IViewColumn, items: any[]) {      
        this.setState({ isLoading: true, page: { results: new Array(10) } as PagedItemCollection<any[]> });
        this.getData(column).then(page => {
            this.setState({ page: page, isLoading: false });
        });

    }

    private get_Columns(viewFields: IViewField[]): IColumn[] {
        let columns: IColumn[] = viewFields.map(f => this.get_Column(f, viewFields));
        return columns;
    }

    private get_Column(viewField: IViewField, viewFields: IViewField[]): IColumn {
        let sortable = viewField.Sortable;
        if (viewField.DataType === DataType.MultiLookup
            || viewField.DataType === DataType.MultiChoice
            || viewField.DataType === DataType.MultiLineText
            || viewField.DataType === DataType.RichText
            || viewField.DataType === DataType.MultiUser
        ) {
            sortable = false;
        }
        else {
            if (sortable === undefined || sortable === null) {
                sortable = true;
            }
        }
        let column = { key: viewField.Name.toLowerCase(), fieldName: viewField.Name, name: viewField.Title, isResizable: true, sortable: sortable } as IViewColumn;
        if (column.fieldName === "LinkTitle") {
            column.fieldName = "Title";
        }

        if (viewField.DataType === DataType.Lookup) {
            column.onRender = (item, index, col) => this.renderLookup(item, index, col, viewField as IViewLookupField, viewFields);
        }
        if (viewField.DataType === DataType.MultiLookup) {
            column.onRender = (item, index, col) => this.renderMultiLookup(item, index, col, viewField as IViewLookupField, viewFields);
        }
        else if (viewField.DataType === DataType.User) {
            column.onRender = (item, index, col) => this.renderUser(item, index, col, viewField, viewFields);
        }
        if (viewField.DataType === DataType.MultiUser) {
            column.onRender = (item, index, col) => this.renderMultiUser(item, index, col, viewField, viewFields);
        }
        else if (viewField.DataType === DataType.MultiChoice) {
            column.onRender = (item, index, col) => this.renderMultiChoice(item, index, col, viewField, viewFields);
        }
        else if (viewField.DataType === DataType.Date) {
            column.onRender = (item, index, col) => this.renderDate(item, index, col, viewField, viewFields);
        }
        else if (viewField.DataType === DataType.DateTime) {
            column.onRender = (item, index, col) => this.renderDateTime(item, index, col, viewField, viewFields);
        }
        return column;
    }

    private renderLookup(item, index, column: IColumn, viewField: IViewLookupField, viewFields: IViewField[]) {
        let value;
        if (viewField.PrimaryFieldName && viewField.LookupFieldName) {
            value = item[`${viewField.PrimaryFieldName}`][(viewField as IViewLookupField).LookupFieldName];
        }
        else {
            value = item[`${viewField.Name}`][(viewField as IViewLookupField).LookupFieldName || "Title"];
        }
        return <span>{value}</span>;
    }

    private renderUser(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        let value = item[`${viewField.Name}`][(viewField as IViewLookupField).LookupFieldName || "Title"];
        return <span>{value}</span>;
    }

    private renderMultiChoice(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        let values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        return <span>{values.join(', ')}</span>;
    }

    private renderMultiLookup(item, index, column: IColumn, viewField: IViewLookupField, viewFields: IViewField[]) {
        let values;
        if (viewField.PrimaryFieldName && viewField.LookupFieldName) {         
            values = item[viewField.PrimaryFieldName] ? item[viewField.PrimaryFieldName].results : [] as string[];
        }
        else {
            values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        }    
        return <span>{values.map(value => `${value[(viewField as IViewLookupField).LookupFieldName || "Title"]}`).join(', ')}</span>;
    }

    private renderMultiUser(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        let values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        return <span>{values.map(value => `${value[(viewField as IViewLookupField).LookupFieldName || "Title"]}`).join(', ')}</span>;
    }

    private renderDate(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        let value = item[viewField.Name];
        if (value) {
            value = DateHelper.toLocaleDate(value, this._timeZone ? this._timeZone.Information.Bias : 0);
            return moment(value).format("L");
        }
        return null;
    }

    private renderDateTime(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        let value = item[viewField.Name];
        if (value) {
            value = DateHelper.toLocaleDate(value, this._timeZone ? this._timeZone.Information.Bias : 0);
            return moment(value).format("L LT");
        }
        return null;
    }
}