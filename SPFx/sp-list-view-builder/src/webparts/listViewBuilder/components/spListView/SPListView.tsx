import * as React from 'react';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { PagedItemCollection } from "@pnp/sp/items";
import { isEqual } from '@microsoft/sp-lodash-subset';
import { IconButton, Icon, Link, Spinner, SpinnerSize, Stack, Breadcrumb, IBreadcrumbItem, IColumn, IGroup, FontIcon, getTheme } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { ListView, IGrouping } from '../../../../controls/listView';
import { IList, IListInfo } from "@pnp/sp/lists";
import { IViewColumn } from '../../../../controls/listView';
import { ITimeZoneInfo, IRegionalSettingsInfo } from "@pnp/sp/regional-settings/types";
import { ISPListViewProps, ISPListViewState } from './ISPListView';
import { DataType, IViewField, IViewLookupField, IFolder, IEditableListItem, IListItem } from '../../../../utilities/Entities';
import moment from 'moment';
import SPService from '../../../../utilities/SPService';
import DateHelper from '../../../../utilities/DateHelper';
import styles from './spListView.module.scss';
import { PermissionKind } from '@pnp/sp/security';
import { cancelable, CancelablePromise } from 'cancelable-promise';
import { SPListForm } from './SPListForm';
import { SPListViewCommandBar } from './SPListViewCommandBar';

const theme = getTheme();

interface CancelablePromise {
    cancel: () => void;
}

export class SPListView extends React.Component<ISPListViewProps, ISPListViewState> {

    private _timeZone: ITimeZoneInfo;
    private _regionalSettings: IRegionalSettingsInfo;
    private _isMounted = false;
    private _shimItemCount = 5;
    private _page?: PagedItemCollection<IListItem[]>;
    private _promises: CancelablePromise[] = [];
    private _listForm: React.RefObject<SPListForm>;

    constructor(props: ISPListViewProps) {
        super(props);

        // Initialize state
        this.state = {
            columns: []
        };

        this._listForm = React.createRef();
    }

    public async componentDidMount() {
        const columns = this.get_Columns(this.props.viewFields);
        this.setState({ isLoading: true, items: new Array(this._shimItemCount) });
        if (this.props.regionalSettings) {
            this._regionalSettings = await this.props.regionalSettings;
        }
        if (this.props.timeZone) {
            this._timeZone = await this.props.timeZone;
        }

        const locale = SPService.getLocaleName(this._regionalSettings.LocaleId);
        moment.locale(locale);
        const folder = this.props.rootFolder;
        this._abortPromises();
        const list = await this._addPromise(this.getListInfo(this.props.list));
        const canAddItem = SPService.doesListHavePermissions(list, PermissionKind.AddListItems);
        const page = await this._addPromise(this.getData(this.props.list, undefined, undefined, folder));
        this._page = page;
        this._isMounted = true;
        this.setState({ items: page.results, canAddItem: canAddItem, columns: columns, isLoading: false, sortColumn: undefined, groupBy: this.props.groupBy, folder: this.props.rootFolder ? { ...this.props.rootFolder } : undefined });
    }

    public async componentDidUpdate(prevProps: ISPListViewProps, prevState: ISPListViewState) {
        if (!isEqual(prevProps, this.props)) {
            await this.componentDidMount();
        }
    }

    public componentWillUnmount() {
        this._isMounted = false;
        this._abortPromises();
    }

    public render(): React.ReactElement {
        const { list, formFields } = this.props;
        const { items, columns, groupBy, isLoading, selection, error } = this.state;
        const page = this._page;
        return <div>
            {this._isMounted === true && this.props.showCommandBar === true && this.renderCommandBar()}
            {!this._isMounted && isLoading && <Spinner size={SpinnerSize.large} />}
            {this._isMounted === true && this.renderBreadcrumb()}
            {this._isMounted === true && <ListView items={items || []} columns={columns} groupBy={groupBy}
                placeholder={(<div>
                    <FontIcon iconName="Search" style={{
                        fontSize: '2em',
                        margin: 25,
                        color: theme.palette.themePrimary
                    }} />
                    <span style={{
                        fontSize: '1.3em',
                    }}>{"No items"}</span>
                </div>)}
                onSelect={this.onSelectItems.bind(this)}
                onSort={this.onSortItems.bind(this)}
                onGroup={this.onGroupItems.bind(this)} />}
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
            {!error && <SPListForm ref={this._listForm} isOpen={false} list={list} listView={this} fields={formFields}
                headerText={this.props.rootFolder ? this.props.rootFolder.Name : ""}
                regionalSettings={this._regionalSettings} timeZone={this._timeZone}
                itemId={selection instanceof Array && selection.length > 0 ? selection[0].ID : 0}
            />}
            {error && <span style={{
                color: 'red',
                display: 'block',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
            }}>{error}</span>}
        </div>;
    }

    protected onSelectItems(selection: IListItem[]) {
        this.setState({ selection: selection });
    }

    private _addPromise(promise: Promise<any>): Promise<any> {
        if (promise) {
            const cancelablePromise = cancelable(promise)
                .catch(error => {
                    this.setState({ error: error });
                })
                .finally(() => {
                    this._removePromise(cancelablePromise);
                });
            this._promises.push(cancelablePromise);
        }
        return promise;
    }

    private _removePromise(cancelablePromise: CancelablePromise) {
        this._promises = this._promises.filter(promise => promise !== cancelablePromise);
    }

    private _abortPromises() {
        for (const promise of this._promises) {
            promise.cancel();
        }
    }

    private async _waitForPromises() {
        return await CancelablePromise.all(this._promises);
    }

    private async loadNextData(page: PagedItemCollection<IEditableListItem[]>) {
        if (page && page.hasNext === true) {
            const { groupBy, items } = this.state;
            this.setState({ isLoading: true, error: undefined, groupBy: undefined, items: [...items, ...new Array(this._shimItemCount)] });
            await this._waitForPromises();
            const nextPage = await this._addPromise(page.getNext());
            const newItems = [...items, ...nextPage.results];
            this._page = nextPage;
            this.setState({ isLoading: false, groupBy: groupBy, items: newItems });
        }
    }

    private loadItemsInFolder(folder: IFolder) {
        const { groupBy } = this.state;
        this._abortPromises();
        this.setState({ isLoading: true, error: undefined, groupBy: undefined, folder: folder, items: new Array(this._shimItemCount) }, () => {
            this._addPromise(this.getData(this.props.list, this.state.sortColumn, this.state.groupBy, folder)).then(page => {
                this._page = page;
                this.setState({ items: page.results, groupBy: groupBy, isLoading: false });
            });
        });
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

    private _processListItems(...items: IEditableListItem[]): IEditableListItem[] {
        if (items instanceof Array && items.length > 0) {
            items.forEach(item => this._processListItem(item));
        }
        return items;
    }

    private _processListItem(item: IEditableListItem): IEditableListItem {
        if (item) {
            if (item.CanEdit === undefined) {
                item.CanEdit = SPService.doesItemHavePermissions(item, PermissionKind.EditListItems);
            }
            if (item.CanDelete === undefined) {
                item.CanDelete = SPService.doesItemHavePermissions(item, PermissionKind.DeleteListItems);
            }
        }
        return item;
    }

    private async getListInfo(list: IList): Promise<IListInfo> {
        if (list) {
            return await list.select('Id', 'Title', 'BaseTemplate', 'RootFolder/ServerRelativeUrl', 'DefaultDisplayFormUrl', 'EffectiveBasePermissions').get();
        }
    }

    private async getData(list: IList, sortColumn?: IViewColumn, groupBy?: IGrouping[], folder?: IFolder): Promise<PagedItemCollection<IEditableListItem[]>> {

        if (!list) return;

        let select = [], expand = [];

        select.push("ID");
        select.push("EffectiveBasePermissions");

        for (const viewField of this.props.viewFields) {
            if (viewField.Name === "DocIcon") {
                continue;
            }
            else if (viewField.Name === "LinkTitle" || viewField.Name === "LinkTitleNoMenu") {
                if (select.indexOf("Title") === -1) {
                    select.push("Title");
                }
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
                if (select.indexOf(viewField.Name) === -1) {
                    select.push(viewField.Name);
                }
            }
        }

        let request = list.items.top(this.props.count || 30);

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

        if (this.props.showFolders === true && (!sortColumn || sortColumn.fieldName !== "DocIcon")) {
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

        if (this.props.orderBy instanceof Array) {
            for (const orderByField of this.props.orderBy) {
                if (orderByField.Name === "DocIcon") {
                    request = request.orderBy("FSObjType", !orderByField.Descending);
                }
                else {
                    request = request.orderBy(orderByField.Name, !orderByField.Descending);
                }
            }
        }

        request = request.orderBy("ID", true);

        const filter = folder ? this.getFilter(this.props.showFolders, this.props.includeSubFolders, folder.ServerRelativeUrl)
            : this.getFilter(this.props.showFolders, this.props.includeSubFolders);

        if (filter) {
            request = request.filter(filter);
        }

        if (groupBy) {
            //TODO: GroupBy in CAML query
        }

        const page = await request.usingCaching().getPaged();
        if (page.getNext instanceof Function) {
            return page;
        }
        return new PagedItemCollection<IEditableListItem[]>(request.usingCaching(), (page as any).nextUrl, page.results);
    }

    private onSortItems(column: IViewColumn) {
        const { groupBy } = this.state;
        this._abortPromises();
        this.setState({ isLoading: true, error: undefined, groupBy: undefined, sortColumn: column, items: new Array(this._shimItemCount) }, () => {
            const folder = this.state.folder || this.props.rootFolder;
            this._addPromise(this.getData(this.props.list, column, groupBy, folder)).then(page => {
                this._page = page;
                this.setState({ items: page.results, groupBy: groupBy, isLoading: false });
            });
        });
    }

    private onGroupItems(groupBy: IGrouping[], columns: IViewColumn[], items: any[], onGroup: (groupedItems: any[], groupBy?: IGrouping[], groups?: IGroup[]) => void) {
        const { viewFields } = this.props;
        groupBy = groupBy.map(g => {
            let viewField = null;
            viewFields.forEach(f => {
                if (SPService.compareFieldNames(f.Name, g.name)) {
                    viewField = f;
                    return;
                }
            });
            return {
                ...g,
                keyGetter: (item) => {
                    if (item) {
                        const value = item[g.name];
                        if (viewField) {
                            if (viewField.DataType === DataType.Lookup || viewField.DataType === DataType.User) {
                                return this.getLookupValue(item, viewField as IViewLookupField);
                            }
                            return this.formatFieldValue(value, viewField.DataType);
                        }
                        return value;
                    }
                    return "";
                }
            } as IGrouping;
        });

        this.setState({ groupBy: groupBy }, () => {
            onGroup(items, groupBy);
        });
    }

    private get_Columns(viewFields: IViewField[]): IColumn[] {
        let columns: IColumn[] = viewFields.map(f => this.get_Column(f, viewFields));
        return columns;
    }

    private get_Column(viewField: IViewField, viewFields: IViewField[]): IColumn {
        let sortable = viewField.Sortable;
        let canGroup = sortable;
        if (viewField.DataType === DataType.MultiLookup
            || viewField.DataType === DataType.MultiChoice
            || viewField.DataType === DataType.MultiLineText
            || viewField.DataType === DataType.RichText
            || viewField.DataType === DataType.MultiUser
            || !!(viewField as IViewLookupField).PrimaryFieldName
        ) {
            sortable = false;
            canGroup = viewField.DataType === DataType.Lookup;
        }
        else {
            if (sortable === undefined || sortable === null) {
                sortable = true;
            }
            if (canGroup === undefined || canGroup === null) {
                canGroup = true;
            }
        }
        let column = { key: viewField.Name.toLowerCase(), fieldName: viewField.Name, name: viewField.Title, isResizable: true, sortable: sortable, canGroup: canGroup } as IViewColumn;
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
            column.onRender = (item, index, col) => this.renderUser(item, index, col, viewField as IViewLookupField, viewFields);
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
        else if (viewField.DataType === DataType.RichText) {
            column.onRender = (item, index, col) => this.renderRichText(item, index, col, viewField, viewFields);
        }
        return column;
    }

    private formatFieldValue(value: string, dataType: DataType): string {
        if (value === undefined || value === null) {
            return "";
        }
        switch (dataType) {
            case DataType.Date:
            case DataType.DateTime:
                const dateValue = DateHelper.toLocalDate(new Date(value), this._timeZone ? this._timeZone.Information.Bias : 0);
                return dataType === DataType.Date ? moment(dateValue).format("L") : moment(dateValue).format("L LT");
            case DataType.Number:
                return Number(value).toString();
            case DataType.Boolean:
                return Boolean(value) === true ? "Yes" : "No";
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

    private renderLookup(item, index: number, column: IColumn, viewField: IViewLookupField, viewFields: IViewField[]) {
        return <span>{this.getLookupValue(item, viewField)}</span>;
    }

    private getLookupValue(item: any, viewField: IViewLookupField) {
        let value;
        if (viewField.PrimaryFieldName && viewField.LookupFieldName) {
            value = item[`${viewField.PrimaryFieldName}`][(viewField as IViewLookupField).LookupFieldName];
        }
        else {
            value = item[`${viewField.Name}`][(viewField as IViewLookupField).LookupFieldName || "Title"];
        }
        return this.formatFieldValue(value, viewField.OutputType);
    }

    private renderUser(item, index, column: IColumn, viewField: IViewLookupField, viewFields: IViewField[]) {
        const value = this.getLookupValue(item, viewField);
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
        const values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        return <span>{values.map(value => value[(viewField as IViewLookupField).LookupFieldName || "Title"]).join(', ')}</span>;
    }

    private renderDateTime(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        const value = item[viewField.Name];
        return this.formatFieldValue(value, viewField.DataType);
    }

    private renderRichText(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        const value = item[viewField.Name];
        return <div dangerouslySetInnerHTML={{ __html: value }} />;
    }

    private renderTitle(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        const isFolder = item["FSObjType"] === 1;
        return isFolder
            ? <Link onClick={() => {
                const folder = { Name: item[column.fieldName], ServerRelativeUrl: item["FileRef"] } as IFolder;
                this.loadItemsInFolder(folder);
            }}>
                {item[column.fieldName]}
            </Link>
            : item[column.fieldName];
    }

    private renderDocIcon(item, index, column: IColumn, viewField: IViewField, viewFields: IViewField[]) {
        const isFolder = item["FSObjType"] === 1;
        return isFolder ? <Icon iconName="FolderHorizontal" /> : <Icon iconName="Document" />;
    }

    private renderBreadcrumb(): JSX.Element {
        const items = this._getBreadcrumbItems();
        //if (items instanceof Array && items.length > 0) {
        const overflowIndex = items.length > 1 ? 1 : 0;
        return <Breadcrumb items={items} className={styles.breadcrumb} maxDisplayedItems={3} overflowIndex={overflowIndex} />;
        //}
        //return null;
    }

    /**
    * Get breadcrumb items
    * @returns an array of IBreadcrumbItem objects
    */
    private _getBreadcrumbItems = (): IBreadcrumbItem[] => {
        const items: IBreadcrumbItem[] = [];
        const { rootFolder } = this.props;
        const { folder } = this.state;

        if (rootFolder) {
            const rootItem: IBreadcrumbItem = {
                text: rootFolder.Name, key: 'root', onClick: () => {
                    this.loadItemsInFolder(rootFolder);
                }
            };

            items.push(rootItem);

            if (folder && folder.ServerRelativeUrl !== rootFolder.ServerRelativeUrl) {
                const folderPathSplit = folder.ServerRelativeUrl.replace(rootFolder.ServerRelativeUrl, '').split('/');
                let folderPath = rootFolder.ServerRelativeUrl;
                folderPathSplit.forEach((folderName, index) => {
                    if (folderName !== '') {
                        folderPath += '/' + folderName;
                        const folderItem: IBreadcrumbItem = {
                            text: folderName, key: `folder-${index.toString()}`, onClick: () => {
                                const subFolder = { Name: folderName, ServerRelativeUrl: folderPath } as IFolder;
                                this.loadItemsInFolder(subFolder);
                            }
                        };
                        items.push(folderItem);
                    }
                });
            }

            items[items.length - 1].isCurrentItem = true;
        }
        return items;
    }


    private renderCommandBar() {
        const { formFields } = this.props;
        const { canAddItem } = this.state;
        const selection = this._processListItems(...this.state.selection);
        return <SPListViewCommandBar listView={this} listForm={this._listForm.current} items={selection} formFields={formFields} canAddItem={canAddItem} />;
    }

    public async deleteItem(...deletedItems: IEditableListItem[]): Promise<void> {
        const { list } = this.props;
        const { items } = this.state;
        if (list && deletedItems instanceof Array && deletedItems.length > 0) {
            this.setState({ isLoading: true, error: undefined, groupBy: undefined, items: new Array(this._shimItemCount) });
            let error = "";
            const promises = deletedItems.map(item => list.items.getById(item.ID).delete()
                .catch(e => {
                    error += e;
                }));
            await this._addPromise(Promise.all(promises));
            if (error) {
                await this.refresh();
                this.setState({ error: error });
            }
            else {
                this.setState({ error: error, isLoading: false, items: items.filter(item => !deletedItems.some(deletedItem => deletedItem.ID === item.ID)) });
            }
        }
    }

    public async refresh() {
        const { list } = this.props;
        const { folder, groupBy, sortColumn, } = this.state;
        this._abortPromises();
        this.setState({ isLoading: true, error: undefined, items: new Array(this._shimItemCount), groupBy: undefined });
        const page = await this._addPromise(this.getData(list, sortColumn, groupBy, folder));
        this._page = page;
        this.setState({ items: page.results, groupBy: groupBy, isLoading: false });
    }
}