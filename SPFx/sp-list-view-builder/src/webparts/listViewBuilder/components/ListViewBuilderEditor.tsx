import * as React from 'react';
import styles from './ListViewBuilder.module.scss';
import { Separator } from 'office-ui-fabric-react/lib/Separator';

import { IListViewBuilderProps } from './IListViewBuilderProps';
import { escape } from '@microsoft/sp-lodash-subset';

import { DefaultButton, Stack, IDropdownOption } from 'office-ui-fabric-react';
import {
  DetailsList, DetailsListLayoutMode, Selection, IColumn,
  IDragDropEvents,
  IDragDropContext
} from 'office-ui-fabric-react/lib/DetailsList';

import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/views";

import { IConfiguration } from '../../../controls/PropertyPaneConfiguration/IConfiguration';

import * as strings from 'ListViewBuilderWebPartStrings';

import AsyncDropdown from '../../../controls/components/AsyncDropdown';

import { IListViewBuilderEditorProps } from './IListViewBuilderEditorProps';

import { AddViewFieldsForm } from './AddViewFieldsForm';


export class ListViewBuilderEditor extends React.Component<IListViewBuilderEditorProps, {
  configuration: IConfiguration,
}> {


  private _addViewFieldsForm: React.RefObject<AddViewFieldsForm>;

  constructor(props) {
    super(props);
    const configuration = props.configuration;
    this.state = {
      configuration: configuration ?
        {
          ListId: configuration.ListId,
          ViewFields: configuration.ViewFields
        }
        //{...props.configuration}
        : null
    };

    this._addViewFieldsForm = React.createRef();
  }

  componentDidUpdate(prevProps: IListViewBuilderEditorProps) {
    if (prevProps.configuration !== this.props.configuration) {
      this.setState({ configuration: this.props.configuration });
    }
  }

  public render(): React.ReactElement<IListViewBuilderProps> {
    const { configuration } = this.state;

    return (
      <div className={styles.listViewBuilder}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>{strings.WebPartName}</span>
              <p className={styles.description}>{escape(strings.PropertyPaneDescription)}</p>
              <Stack tokens={{ childrenGap: 40 }}>
                <Stack.Item>
                  <span>{"List:"}</span>
                  <AsyncDropdown loadOptions={this.loadLists.bind(this)} selectedKey={configuration ? configuration.ListId : null} onChanged={this.onListChanged.bind(this)} />
                  <Separator></Separator>
                </Stack.Item>
                <Stack.Item>
                  <span>{"View Fields:"}</span>
                  <>
                    <CommandBar
                      items={[
                        { key: 'addFields', text: 'Add', iconProps: { iconName: 'Add' }, onClick: () => this._addViewFieldsForm.current.setState({ isOpen: true }) }
                      ]}
                    />
                    <DetailsList
                      items={configuration ? configuration.ViewFields || [] : []}
                      columns={[
                        { key: 'title', name: 'Title', fieldName: 'Title', minWidth: 100, maxWidth: 200, isResizable: true },
                        { key: 'name', name: 'Name', fieldName: 'Name', minWidth: 100, maxWidth: 200, isResizable: true }
                      ]}
                      setKey="set"
                      layoutMode={DetailsListLayoutMode.justified}
                      selectionPreservedOnEmptyClick={true}
                    />
                  </>
                 <Separator></Separator>
                </Stack.Item>                
                <Stack.Item>
                  <DefaultButton text="Save" onClick={() => this.saveConfiguration(this.props.configurationId, configuration, this.props.configListTitle)} allowDisabledFocus disabled={this.props.configurationId < 1} />
                </Stack.Item>
              </Stack>
              <AddViewFieldsForm ref={this._addViewFieldsForm} listId ={ this.props.configuration ? this.props.configuration.ListId : null} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private saveConfiguration(configurationId: number, configuration: IConfiguration, configListTitle: string): Promise<boolean> {
    return new Promise<boolean>((resolve: (boolean) => void, reject: (error: any) => void) => {
      try {
        return sp.web.lists.getByTitle(configListTitle).items.getById(configurationId).update({
          Data: JSON.stringify(configuration)
        })
          .then(() => {
            resolve(true);
          }).catch(e => {
            reject(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  }

  private loadLists(): Promise<IDropdownOption[]> {
    return new Promise<IDropdownOption[]>((resolve: (options: IDropdownOption[]) => void, reject: (error: any) => void) => {
      try {
        return sp.web.lists.filter('Hidden eq false').get()
          .then((lists) => {
            let options = lists.map((l) => ({ key: l.Id, text: l.Title }) as IDropdownOption);
            resolve(options);
          }).catch(e => {
            reject(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  } 

  private onListChanged(option: IDropdownOption, index?: number): void {
    let { configuration } = this.state;
    configuration.ListId = option.key as string;
    configuration.ViewFields = [];
    this.setState({ configuration: configuration });
  } 
}
