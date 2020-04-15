import * as React from 'react';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { PagedItemCollection, Item } from "@pnp/sp/items";
import { isEqual } from '@microsoft/sp-lodash-subset';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IconButton, Icon, Link } from 'office-ui-fabric-react';
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { ListView, IListViewProps } from '../../../../controls/listView';
import { IViewColumn } from '../../../../controls/listView';
import { ITimeZoneInfo, IRegionalSettingsInfo } from "@pnp/sp/regional-settings/types";
import { ISPListViewProps, ISPListViewState } from './ISPListView';
import { DataType, IViewField, IViewLookupField, IFolder } from '../../../../utilities/Entities';
import moment from 'moment';
import SPService from '../../../../utilities/SPService';
import DateHelper from '../../../../utilities/DateHelper';

export class SPListView extends React.Component<ISPListViewProps, ISPListViewState> {

    private _timeZone: ITimeZoneInfo;
    private _regionalSettings: IRegionalSettingsInfo;
    private _isMounted = false;

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

        const locale = SPService.getLocaleName(this._regionalSettings.LocaleId);
        moment.locale(locale);
        const folder = this.props.rootFolder;
        const page = await this.getData(undefined, folder);
        this._isMounted = true;
        this.setState({ page: page, columns: columns, isLoading: false, sortColumn: undefined, folder: this.props.rootFolder ? { ...this.props.rootFolder } : undefined });
    }

    public async componentDidUpdate(prevProps: ISPListViewProps, prevState: ISPListViewState) {
        if (!isEqual(prevProps, this.props)) {
            await this.componentDidMount();
        }
    }

    public componentWillUnmount() {

    }

    public render(): React.ReactElement {
        const { page, columns, isLoading } = this.state;
        return <div>
            {!this._isMounted && isLoading /*&& !page*/ && <Spinner size={SpinnerSize.large} />}
            {this._isMounted === true && <ListView items={page ? page.results : []} columns={columns} onSelect={this.onSelectItems.bind(this)} onSort={this.onSortItems.bind(this)} />}
            {this._isMounted === true && !isLoading && (page && page.hasNext === true) && <Stack verticalAlign="center" horizontalAlign="center">
                <IconButton
                    title={"More"}
                    iconProps={{ iconName: 'ChevronDown' }}
                    ariaLabel="More"
                    styles={{
                        root: {
                            width: '100%'
                        }
                    }}
                    onClick={() => {
                        this.loadNextData(page);
                    }}
                />
            </Stack>}
        </div>;
    }

    private async loadNextData(page: PagedItemCollection<any>) {
        if (page && page.hasNext === true) {
            const results = (page.results as any[] || []).concat(new Array(10));
            this.setState({ isLoading: true, page: { results: results } as PagedItemCollection<any[]> });
            const nextPage = await page.getNext();
            nextPage.results = (page.results as any[] || []).concat(nextPage.results as any[] || []);
            this.setState({ isLoading: false, page: nextPage });
        }
    }

    private getFilter(showFolders?: boolean, includeSubFolders?: boolean, ...folderServerRelativeUrls: string[]): string {
        let filter = !showFolders || includeSubFolders === true ? "FSObjType eq 0" : "";
        folderServerRelativeUrls = folderServerRelativeUrls.filter(url => !!url);
        if (folderServerRelativeUrls instanceof Array && folderServerRelativeUrls.length > 0) {
            if (filter) {
                filter += " and ";
            }
            if (includeSubFolders === true) {
                filter += `( ${folderServerRelativeUrls.map(folderServerRelativeUrl =>
                    `startswith(FileDirRef, '${folderServerRelativeUrl}')`).join(' or ')} )`;
            }
            else {
                filter += `( ${folderServerRelativeUrls.map(folderServerRelativeUrl =>
                    `FileDirRef eq '${folderServerRelativeUrl}'`).join(' or ')} )`;
            }
        }
        return filter;
    }

    private async getData(sortColumn?: IViewColumn, folder?: IFolder): Promise<PagedItemCollection<any>> {
        let select = [], expand = [];
        for (const viewField of this.props.viewFields) {
            if (viewField.Name === "DocIcon") {
                continue;
            }
            else if (viewField.Name === "LinkTitle" || viewField.Name === "LinkTitleNoMenu") {
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
                select.push(`${lookupField.Name}/Title`);
                select.push(`${lookupField.Name}/Name`);
                select.push(`${lookupField.Name}/EMail`);
                expand.push(lookupField.Name);
            }
            else {
                select.push(viewField.Name);
            }
        }

        let request = sp.web.lists.getById(this.props.listId).items.top(this.props.count || 30);

        if (select.length > 0) {
            if (select.indexOf("FSObjType") === -1) {
                select.push("FSObjType");
            }
            if (select.indexOf("FileDirRef") === -1) {
                select.push("FileDirRef");
            }
            if (select.indexOf("FileRef") === -1) {
                select.push("FileRef");
            }
            request = request.select(...select);
        }
        if (expand.length > 0) {
            request = request.expand(...expand);
        }

        if (this.props.showFolders === true && (sortColumn && sortColumn.fieldName !== "DocIcon")) {
            request = request.orderBy("FSObjType", false);
        }

        if (sortColumn) {
            if (sortColumn.fieldName === "DocIcon") {
                request = request.orderBy("FSObjType", !sortColumn.isSortedDescending);
            }
            else {
                request = request.orderBy(sortColumn.fieldName, !sortColumn.isSortedDescending);
            }
        }

        const filter = folder ? this.getFilter(this.props.showFolders, this.props.includeSubFolders, folder.ServerRelativeUrl)
            : this.getFilter(this.props.showFolders, this.props.includeSubFolders);

        if (filter) {
            request = request.filter(filter);
        }
        return await request.usingCaching().getPaged();
    }

    private onSelectItems(items: any[]) {

    }

    private onSortItems(column: IViewColumn, items: any[]) {
        this.setState({ isLoading: true, sortColumn: column, page: { results: new Array(10) } as PagedItemCollection<any[]> }, () => {
            const folder = this.state.folder || this.props.rootFolder;
            this.getData(column, folder).then(page => {
                this.setState({ page: page, isLoading: false });
            });
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
            || !!(viewField as IViewLookupField).PrimaryFieldName
        ) {
            sortable = false;
        }
        else {
            if (sortable === undefined || sortable === null) {
                sortable = true;
            }
        }
        let column = { key: viewField.Name.toLowerCase(), fieldName: viewField.Name, name: viewField.Title, isResizable: true, sortable: sortable } as IViewColumn;
        if (column.fieldName === "LinkTitle" || column.fieldName === "LinkTitleNoMenu") {
            column.fieldName = "Title";
        }
        if (column.fieldName === "Title") {
            column.onRender = (item, index, col) => this.renderTitle(item, index, col, viewField as IViewLookupField, viewFields);
        }
        else if (column.fieldName === "DocIcon") {
            column.maxWidth = 30;
            column.minWidth = 30;
            column.currentWidth = 30;
            column.isResizable = false;
            column.isIconOnly = true;
            column.iconName = "Document";
            column.onRender = (item, index, col) => this.renderDocIcon(item, index, col, viewField as IViewLookupField, viewFields);
        }
        else if (viewField.DataType === DataType.Lookup) {
            column.onRender = (item, index, col) => this.renderLookup(item, index, col, viewField as IViewLookupField, viewFields);
        }
        else if (viewField.DataType === DataType.Boolean) {
            column.onRender = (item, index, col) => this.renderBoolean(item, index, col, viewField as IViewLookupField, viewFields);
        }
        else if (viewField.DataType === DataType.MultiLookup) {
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
        else if (viewField.DataType === DataType.Date || viewField.DataType === DataType.DateTime) {
            column.onRender = (item, index, col) => this.renderDateTime(item, index, col, viewField, viewFields);
        }
        return column;
    }

    private formatFieldValue(value: string, dataType: DataType): string {
        if (value) {
            switch (dataType) {
                case DataType.Date:
                case DataType.DateTime:
                    const dateValue = DateHelper.toLocaleDate(new Date(value), this._timeZone ? this._timeZone.Information.Bias : 0);
                    return dataType === DataType.Date ? moment(dateValue).format("L") : moment(dateValue).format("L LT");
                case DataType.Number:
                    return Number(value).toString();
                case DataType.Boolean:
                    return Boolean(value) === true ? "Yes" : "No";
            }
        }
        return value;
    }

    private renderBoolean(item, index, column: IColumn, viewField: IViewLookupField, viewFields: IViewField[]) {
        const value = item[viewField.Name];
        if (value !== undefined && value !== null) {
            return value === true ? "Yes" : "No";
        }
        return value;
    }

    private renderLookup(item, index, column: IColumn, viewField: IViewLookupField, viewFields: IViewField[]) {
        let value;
        if (viewField.PrimaryFieldName && viewField.LookupFieldName) {
            value = item[`${viewField.PrimaryFieldName}`][(viewField as IViewLookupField).LookupFieldName];
        }
        else {
            value = item[`${viewField.Name}`][(viewField as IViewLookupField).LookupFieldName || "Title"];
        }
        return <span>{this.formatFieldValue(value, viewField.OutputType)}</span>;
    }

    private renderUser(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        let value = item[`${viewField.Name}`][(viewField as IViewLookupField).LookupFieldName || "Title"];
        return <span>{value}</span>;
    }

    private renderMultiChoice(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        let values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        return <span>{values.map(value => this.formatFieldValue(value, viewField.OutputType)).join(', ')}</span>;
    }

    private renderMultiLookup(item, index, column: IColumn, viewField: IViewLookupField, viewFields: IViewField[]) {
        let values;
        if (viewField.PrimaryFieldName && viewField.LookupFieldName) {
            values = item[viewField.PrimaryFieldName] ? item[viewField.PrimaryFieldName].results : [] as string[];
        }
        else {
            values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        }
        return <span>{values.map(value => this.formatFieldValue(value[(viewField as IViewLookupField).LookupFieldName || "Title"], viewField.OutputType)).join(', ')}</span>;
    }

    private renderMultiUser(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        let values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        return <span>{values.map(value => value[(viewField as IViewLookupField).LookupFieldName || "Title"]).join(', ')}</span>;
    }

    private renderDateTime(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        let value = item[viewField.Name];
        return this.formatFieldValue(value, viewField.DataType);
    }

    private renderTitle(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        const isFolder = item["FSObjType"] === 1;
        return isFolder
            ? <Link onClick={() => {
                const folder = { Name: item[column.fieldName], ServerRelativeUrl: item["FileRef"] } as IFolder;
                this.setState({ isLoading: true, folder: folder, page: { results: new Array(10) } as PagedItemCollection<any[]> }, () => {
                    this.getData(this.state.sortColumn, folder).then(page => {
                        this.setState({ page: page, isLoading: false });
                    });
                });
            }}>
                {item[column.fieldName]}
            </Link>
            : item[column.fieldName];
    }

    private renderDocIcon(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        const isFolder = item["FSObjType"] === 1;
        return isFolder ? <Icon iconName="FolderHorizontal" /> : <Icon iconName="Document" />;
    }
}