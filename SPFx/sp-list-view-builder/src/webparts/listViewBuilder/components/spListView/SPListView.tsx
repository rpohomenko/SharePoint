import * as React from 'react';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
//import { ICamlQuery } from "@pnp/sp/lists";
import "@pnp/sp/items";
import { isArray } from '@pnp/common';

import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { LazyListView, ILazyListViewProps } from '../../../../controls/lazyListView';
import { IViewColumn } from '../../../../controls/listView';

import { ISPListViewProps, ISPListViewState, DataType, IViewField, IViewLookupField } from './ISPListView';

export class SPListView extends React.Component<ISPListViewProps, ISPListViewState> {

    constructor(props: ISPListViewProps) {
        super(props);

        // Initialize state
        this.state = {

        };
    }

    private async getData(): Promise<any[]> {
        const viewFields = this.get_ViewFields(this.props.viewFields);
        const lookups = this.props.viewFields
            .filter(f => f.DataType === DataType.Lookup || f.DataType === DataType.User || f.DataType === DataType.MultiLookup || f.DataType === DataType.MultiUser)
            .map(l => l.Name);
        return await sp.web.lists.getById(this.props.listId).items.top(this.props.count || 30).select(...viewFields).expand(...lookups).getPaged()
            .then((page) => {
                return page.results;
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
        return React.createElement(LazyListView, {
            asyncItems: this.getData(),
            columns: this.get_Columns(this.props.viewFields),
            onSelect: this.onSelectItems.bind(this)
        } as ILazyListViewProps);
    }
}