import * as React from 'react';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
//import { ICamlQuery } from "@pnp/sp/lists";
import { PagedItemCollection } from "@pnp/sp/items";
import { isArray } from '@pnp/common';
import { isEqual } from '@microsoft/sp-lodash-subset';

import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
//import { LazyListView, ILazyListViewProps } from '../../../../controls/lazyListView';
import { ListView, IListViewProps } from '../../../../controls/listView';
import { IViewColumn } from '../../../../controls/listView';

import { ISPListViewProps, ISPListViewState, DataType, IViewField, IViewLookupField } from './ISPListView';

export class SPListView extends React.Component<ISPListViewProps, ISPListViewState> {

    private _columns: IViewColumn[];

    constructor(props: ISPListViewProps) {
        super(props);

        // Initialize state
        this.state = {
        };
    }

    public componentDidMount() {

        this._columns = this.get_Columns(this.props.viewFields);

        this.getData().then(page => {
            this.setState({ page: page });
        });
    }

    public componentDidUpdate(prevProps: ISPListViewProps, prevState: ISPListViewState): void {
        if (!isEqual(prevProps, this.props)) {
            this._columns = this.get_Columns(this.props.viewFields);
        }
    }

    private async getData(sortColumn?: IViewColumn): Promise<PagedItemCollection<any>> {
        const viewFields = this.get_ViewFields(this.props.viewFields);
        const lookups = this.props.viewFields
            .filter(f => f.DataType === DataType.Lookup || f.DataType === DataType.User || f.DataType === DataType.MultiLookup || f.DataType === DataType.MultiUser)
            .map(l => l.Name);
        let request = sp.web.lists.getById(this.props.listId).items
            .top(this.props.count || 30)
            .select(...viewFields)
            .expand(...lookups);

        if (sortColumn) {
            request = request.orderBy(sortColumn.fieldName, sortColumn.isSortedDescending);
        }

        return await request.getPaged()
            .then((page) => {
                return page;
            });
    }

    private get_ViewFields(viewFields: IViewField[]): string[] {
        let fields: string[] = ["ID"];

        for (let i = 0; i < viewFields.length; i++) {
            const viewField = viewFields[i];
            fields = fields.concat(this.get_ViewField(viewField));
        }
        return fields;
    }

    private get_ViewField(field: IViewField): string[] {
        if (field.Name === "LinkTitle") {
            return ["Title"];
        }
        if (field.DataType === DataType.Lookup
            || field.DataType === DataType.MultiLookup
        ) {
            const lookupField = field as IViewLookupField;
            return [`${field.Name}/ID`, `${field.Name}/${lookupField.LookupFieldName || "Title"}`];
        }
        if (field.DataType === DataType.User
            || field.DataType === DataType.MultiUser
        ) {
            const lookupField = field as IViewLookupField;
            return [`${field.Name}/ID`, `${field.Name}/EMail`, `${field.Name}/Name`, `${field.Name}/${lookupField.LookupFieldName || "Title"}`];
        }
        return [field.Name];
    }

    private onSelectItems(items: any[]) {

    }

    private onSortItems(column: IViewColumn, items: any[]) {
        this.getData(column).then(page => {
            this.setState({ page: page });
        });
    }

    private get_Columns(viewFields: IViewField[]): IColumn[] {
        let columns: IColumn[] = viewFields.map(f => this.get_Column(f));
        return columns;
    }

    private get_Column(viewField: IViewField): IColumn {
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
            column.onRender = (item, index, column) => this.renderLookup(item, index, column, viewField);
        }
        if (viewField.DataType === DataType.MultiLookup) {
            column.onRender = (item, index, column) => this.renderMultiLookup(item, index, column, viewField);
        }
        else if (viewField.DataType === DataType.User) {
            column.onRender = (item, index, column) => this.renderUser(item, index, column, viewField);
        }
        if (viewField.DataType === DataType.MultiUser) {
            column.onRender = (item, index, column) => this.renderMultiUser(item, index, column, viewField);
        }
        else if (viewField.DataType === DataType.MultiChoice) {
            column.onRender = (item, index, column) => this.renderMultiChoice(item, index, column, viewField);
        }
        return column;
    }

    private renderLookup(item, index, column: IColumn, viewField: IViewField) {
        let value = item[`${viewField.Name}`][(viewField as IViewLookupField).LookupFieldName || "Title"];
        return <span>{value}</span>;
    }

    private renderUser(item, index, column: IColumn, viewField: IViewField) {
        let value = item[`${viewField.Name}`][(viewField as IViewLookupField).LookupFieldName || "Title"];
        return <span>{value}</span>;
    }

    private renderMultiChoice(item, index, column: IColumn, viewField: IViewField) {
        let values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        return <span>{values.join(', ')}</span>;
    }

    private renderMultiLookup(item, index, column: IColumn, viewField: IViewField) {
        let values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        return <span>{values.map(value => `${value[(viewField as IViewLookupField).LookupFieldName || "Title"]}`).join(', ')}</span>;
    }

    private renderMultiUser(item, index, column: IColumn, viewField: IViewField) {
        let values = item[viewField.Name] ? item[viewField.Name].results : [] as string[];
        return <span>{values.map(value => `${value[(viewField as IViewLookupField).LookupFieldName || "Title"]}`).join(', ')}</span>;
    }

    public render(): React.ReactElement {
        const { page } = this.state;
        return React.createElement(ListView, {
            items: page ? page.results : null,
            columns: this._columns,
            onSelect: this.onSelectItems.bind(this),
            onSort: this.onSortItems.bind(this)
        } as IListViewProps);
    }
}