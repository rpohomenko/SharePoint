import * as React from 'react';
import styles from './ListViewBuilder.module.scss';
import { Separator } from 'office-ui-fabric-react/lib/Separator';

import { IListViewBuilderProps } from './IListViewBuilderProps';
import { escape } from '@microsoft/sp-lodash-subset';
//import { DisplayMode, Environment, EnvironmentType, Version, Guid } from '@microsoft/sp-core-library';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
//import { ICamlQuery } from "@pnp/sp/lists";
import "@pnp/sp/items";

import { ListView, IViewField, SelectionMode, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";

import { IConfiguration } from '../IConfiguration';
//import CamlBuilder from 'camljs';
//import { ListViewBuilderEditor } from './ListViewBuilderEditor';


export default class ListViewBuilder extends React.Component<IListViewBuilderProps, {
  //configuration: IConfiguration,
  items: any[],
  groupByFields?: IGrouping[]
}> {

  //private _configuration: IConfiguration;

  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
  }

  componentDidMount() {
    if (this.props.configuration) {
      this.getData().then(data => {
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

    if (!configuration) return (<>{"No configuration!"}</>);

    const viewFields = configuration.ViewFields.map(f => { return { name: f.Name, displayName: f.Title, isResizable: true } as IViewField; });

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

  private async getData() {
    return await sp.web.lists.getById(this.props.configuration.ListId).items.top(30).getPaged();
  }
}
