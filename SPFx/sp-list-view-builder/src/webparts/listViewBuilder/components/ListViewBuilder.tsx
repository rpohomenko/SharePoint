import * as React from 'react';
import styles from './ListViewBuilder.module.scss';
//import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { IListViewBuilderProps } from './IListViewBuilderProps';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
//import { ICamlQuery } from "@pnp/sp/lists";
import "@pnp/sp/items";
import { isArray } from '@pnp/common';

import {IViewField, DataType, SPListView, ISPListViewProps} from "./spListView";

export default class ListViewBuilder extends React.Component<IListViewBuilderProps, {
  items: any[],
  //groupByFields?: IGrouping[];
  rowLimit? : number;
}> {

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      rowLimit: 30
    };
  }

  public componentDidMount() {
   
  }

  public componentDidUpdate(prevProps: IListViewBuilderProps) {
   
  }

  public render(): React.ReactElement<IListViewBuilderProps> {   
    const { configuration } = this.props;

    if (!configuration || !isArray(configuration.ViewFields)) return (<>{"No configuration!"}</>);
  
    return (
      <div className={styles.listViewBuilder}>     
        <SPListView listId={configuration.ListId} viewFields={configuration.ViewFields} />
      </div>
    );
  } 
}
