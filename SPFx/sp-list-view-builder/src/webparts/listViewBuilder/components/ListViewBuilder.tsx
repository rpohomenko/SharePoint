import * as React from 'react';
import styles from './ListViewBuilder.module.scss';
import { Separator } from 'office-ui-fabric-react/lib/Separator';

import { IListViewBuilderProps } from './IListViewBuilderProps';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
//import { ICamlQuery } from "@pnp/sp/lists";
import "@pnp/sp/items";

import { ListView, IViewField as IColumn, SelectionMode, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";

import { IConfiguration, IViewField, IViewLookupField, DataType } from '../IConfiguration';
import { isArray } from '@pnp/common';

export default class ListViewBuilder extends React.Component<IListViewBuilderProps, {
  //configuration: IConfiguration,
  items: any[],
  groupByFields?: IGrouping[];
  rowLimit? : number;
}> {

  //private _configuration: IConfiguration;

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      rowLimit: 30
    };
  }

  componentDidMount() {
    const{ configuration} = this.props;
    if (configuration && isArray(configuration.ViewFields)) {
      const viewFields = this.get_ViewFields(configuration.ViewFields);      
      const lookups = configuration.ViewFields
         .filter(f => f.DataType === DataType.Lookup || f.DataType === DataType.User || f.DataType === DataType.MultiLookup || f.DataType === DataType.MultiUser)
         .map(l => l.Name);
      const count = this.state.rowLimit;
      this.getData(viewFields, count, lookups).then(data => {
        let items: any[] = [];
        if (data) {
          items = data.results;
        }
        this.setState({ items: items });
      })
    }

    /*if (this.props.configurationId > 0) {
      this.loadConfiguration(this.props.configurationId, this.props.configListTitle).then((configuration: IConfiguration) => {
        this.setState({ configuration: configuration });
      });
    }*/
  }

  /*componentDidUpdate(prevProps: IListViewBuilderProps) {
    if (prevProps.configurationId !== this.props.configurationId && this.props.configurationId > 0) {
      this.loadConfiguration(this.props.configurationId, this.props.configListTitle).then((configuration: IConfiguration) => {
        this.setState({ configuration: configuration });
      });
    }
  }*/

  public render(): React.ReactElement<IListViewBuilderProps> {
    /*const inDesignMode: boolean = this.props.inDesignMode;
    const configurationId = this.props.configurationId;
    const environmentType: EnvironmentType = Environment.type;
    let { configuration } = this.state;*/

    /*if (inDesignMode) {
      return <ListViewBuilderEditor configurationId={configurationId} configuration={configuration} configListTitle={this.props.configListTitle} />;
    }*/

    const { configuration } = this.props;
    const { items, groupByFields } = this.state;

    if (!configuration || !isArray(configuration.ViewFields)) return (<>{"No configuration!"}</>);

    const viewFields = this.get_Columns(configuration.ViewFields);
    return (
      <div className={styles.listViewBuilder}>
        <ListView
          items={items}
          viewFields={viewFields}
          compact={false}
          selectionMode={SelectionMode.multiple}
          selection={this._getSelection}
          showFilter={true}
          defaultFilter=""
          filterPlaceHolder={"Search..."}
          groupByFields={groupByFields} />
      </div>
    );
  }

  private get_Columns(viewFields: IViewField[]): IColumn[] {
    let columns: IColumn[] = viewFields.map(f => this.get_Column(f));   
    return columns;
  }

  private get_Column(viewField: IViewField): IColumn {
    let sorting = viewField.Sortable;
    if (viewField.DataType === DataType.MultiLookup
      || viewField.DataType === DataType.MultiChoice
      || viewField.DataType === DataType.MultiLineText
      || viewField.DataType === DataType.RichText
      || viewField.DataType === DataType.MultiUser
    ) {
      sorting = false;
    }
    else {
      if (sorting === undefined || sorting === null) {
        sorting = true;
      }
    }
    let column = { name: viewField.Name, displayName: viewField.Title, isResizable: true, sorting: sorting } as IColumn;
    if (column.name === "LinkTitle") {
      column.name = "Title";
    }

    if(viewField.DataType === DataType.Lookup){
      column.render = (item, index, column) => this.renderLookup(item, index, column, viewField);
    }
    if(viewField.DataType === DataType.MultiLookup){
      column.render = (item, index, column) => this.renderMultiLookup(item, index, column, viewField);
    }
    else if(viewField.DataType === DataType.User){
      column.render = (item, index, column) => this.renderUser(item, index, column, viewField);
    }
    if(viewField.DataType === DataType.MultiUser){
      column.render = (item, index, column) => this.renderMultiUser(item, index, column, viewField);
    }
    else if(viewField.DataType === DataType.MultiChoice){
      column.render = (item, index, column) => this.renderMultiChoice(item, index, column, viewField);
    }
    return column;
  }

  private renderLookup(item, index, column: IColumn, viewField: IViewField) {
    let value = item[`${viewField.Name}.${(viewField as IViewLookupField).LookupFieldName || "Title"}`];
    return <span>{value}</span>;
  }

  private renderUser(item, index, column: IColumn, viewField: IViewField) {
    let value = item[`${viewField.Name}.${(viewField as IViewLookupField).LookupFieldName || "Title"}`];
    return <span>{value}</span>;
  }

  private renderMultiChoice(item, index, column: IColumn, viewField: IViewField) {
    const {items} = this.state;
    const row = items[index];
    let values = row[viewField.Name].results as string[];
    return <span>{values.join(', ')}</span>;
  }

  private renderMultiLookup(item, index, column: IColumn, viewField: IViewField) {
    const {items} = this.state;
    const row = items[index];
    let values = row[viewField.Name].results as string[];
    return <span>{values.map(value => `${ value[(viewField as IViewLookupField).LookupFieldName || "Title"] }` ).join(', ')}</span>;
  }

  private renderMultiUser(item, index, column: IColumn, viewField: IViewField) {
    const {items} = this.state;
    const row = items[index];
    let values = row[viewField.Name].results as string[];
    return <span>{values.map(value => `${ value[(viewField as IViewLookupField).LookupFieldName || "Title"] }` ).join(', ')}</span>;
  }

  private get_ViewFields(viewFields: IViewField[]):string[]{    
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

  private _getSelection(items: any[]) {
    console.log('Selected items:', items);
  }

  /*private loadConfiguration(configurationId: number, configListTitle: string): Promise<IConfiguration> {
    return new Promise<IConfiguration>((resolve: (configuration: IConfiguration) => void, reject: (error: any) => void) => {
      try {
        const caml: ICamlQuery = {
          ViewXml: new CamlBuilder().View(["ID", "Title", "Data"]).Scope(CamlBuilder.ViewScope.Recursive).RowLimit(1).Query().Where().CounterField("ID").EqualTo(configurationId).ToString()
        };
        return sp.web.lists.getByTitle(configListTitle).getItemsByCAMLQuery(caml)
          .then((items) => {
            let result = items.map((i) => JSON.parse(i.Data) as IConfiguration);
            this._configuration = result.length > 0 ? result[0] : null;
            resolve(this._configuration);
          }).catch(e => {
            reject(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  }*/

  private async getData(viewFields:string[], count: number, lookups: string[]) {
    return await sp.web.lists.getById(this.props.configuration.ListId).items.top(count).select(...viewFields).expand(...lookups).getPaged();
  }
}
