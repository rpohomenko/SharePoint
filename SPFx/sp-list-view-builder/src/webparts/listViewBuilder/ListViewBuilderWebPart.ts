import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DisplayMode, Environment, EnvironmentType, Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { setup as pnpSetup, isArray } from "@pnp/common";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import { ICamlQuery } from "@pnp/sp/lists";
import "@pnp/sp/items";

import * as strings from 'ListViewBuilderWebPartStrings';
import ListViewBuilder from './components/ListViewBuilder';
import { IListViewBuilderProps } from './components/IListViewBuilderProps';
import { PropertyPaneAsyncDropdown } from '../../controls/PropertyPaneConfiguration/PropertyPaneAsyncDropdown';
import { IConfigurationOption, IConfiguration } from '../../controls/PropertyPaneConfiguration/IConfiguration';
import { update, get } from '@microsoft/sp-lodash-subset';
import CamlBuilder from 'camljs';
import { proxyUrl, webRelativeUrl } from '../../settings';

export interface IListViewBuilderWebPartProps {
  description: string;
  configurationId: number;
}

export default class ListViewBuilderWebPart extends BaseClientSideWebPart<IListViewBuilderWebPartProps> {

  private _configurations: Array<IConfigurationOption>;
  private _configListTitle = "LVBuilderConfigurations";

  public render(): void {

    //debugger;
    const inDesignMode: boolean = this.displayMode === DisplayMode.Edit;
    const environmentType: EnvironmentType = Environment.type;

    const element: React.ReactElement<IListViewBuilderProps> = React.createElement(
      ListViewBuilder,
      {
        inDesignMode: inDesignMode,
        description: this.properties.description,
        configurationId: this.properties.configurationId,
        configListTitle: this._configListTitle
      }
    );

    ReactDom.render(element, this.domElement);
  }

  /**
* Initialize the web part.
*/
  protected onInit(): Promise<void> {
    return super.onInit().then(_ => {
      if (Environment.type == EnvironmentType.Local) {
        const url = `${proxyUrl}${webRelativeUrl}`;
        sp.setup({
          sp: {
            headers: {
              Accept: "application/json;odata=verbose",
            },
            baseUrl: url
          },
        });
      }
      else {
        pnpSetup({
          spfxContext: this.context
        });
      }
    });
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                /*PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),*/
                /*PropertyPaneTextField('configurationId',{
                  label: strings.ConfigurationIdFieldLabel
                }),*/
                new PropertyPaneAsyncDropdown('configurationId', {
                  label: strings.ConfigurationIdFieldLabel,
                  loadOptions: this.loadConfigurations.bind(this),
                  onPropertyChange: this.onPropertyChange.bind(this),
                  selectedKey: this.properties.configurationId
                })

              ]
            }
          ]
        }
      ]
    };
  }

  private onPropertyChange(propertyPath: string, newValue: any, index?: number): void {
    //debugger;
    let selected = this._configurations[index];
    // store new value in web part properties
    update(this.properties, propertyPath, (): any => { return newValue; });
    // refresh web part
    this.render();
  }

  private loadConfigurations(): Promise<IConfigurationOption[]> {
    return new Promise<IConfigurationOption[]>((resolve: (options: IConfigurationOption[]) => void, reject: (error: any) => void) => {
      try {
        //debugger;
        const caml: ICamlQuery = {
          ViewXml: new CamlBuilder().View(["ID", "Title"]).Scope(CamlBuilder.ViewScope.Recursive).RowLimit(100).ToString()
        };
        return sp.web.lists.getByTitle(this._configListTitle).getItemsByCAMLQuery(caml)
          .then((items) => {
            this._configurations = items.map((i) => ({ key: i.Id, text: i.Title/*, data: i.Data*/ } as IConfigurationOption));
            resolve(this._configurations);
          }).catch(e => {
            //debugger;
            console.error(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  }
}
