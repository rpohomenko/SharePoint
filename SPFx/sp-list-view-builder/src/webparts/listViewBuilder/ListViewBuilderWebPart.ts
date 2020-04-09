import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DisplayMode, Environment, EnvironmentType, Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import { IDropdownOption } from 'office-ui-fabric-react';

import { setup as pnpSetup, isArray } from "@pnp/common";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";
import * as strings from 'ListViewBuilderWebPartStrings';
import ListViewBuilder from './components/ListViewBuilder';

import { PropertyPaneAsyncDropdown } from '../../controls/propertyPane/propertyPaneAsyncDropdown/PropertyPaneAsyncDropdown';
import { PropertyPaneViewFieldList } from '../../controls/propertyPane/PropertyPaneViewFieldList';

import { IConfiguration } from './IConfiguration';
import { IViewField } from './components/spListView/ISPListView';
import { update, get } from '@microsoft/sp-lodash-subset';
import { proxyUrl, webRelativeUrl } from '../../settings';

export interface IListViewBuilderWebPartProps {
  description: string;
  listId: string;
  viewFields: IViewField[];
}

export default class ListViewBuilderWebPart extends BaseClientSideWebPart<IListViewBuilderWebPartProps> {

  public render(): void {
  
    const inDesignMode: boolean = this.displayMode === DisplayMode.Edit;    
    //const environmentType: EnvironmentType = Environment.type;

    let element: React.ReactElement;
    if (!!this.properties.listId && this.properties.viewFields instanceof Array && this.properties.viewFields.length > 0) {
      element = React.createElement(
        ListViewBuilder,
        {
          inDesignMode: inDesignMode,
          description: this.properties.description,       
          configuration: this.properties.listId
            ? { ListId: this.properties.listId, ViewFields: this.properties.viewFields } as IConfiguration
            : null
        });
    }
    else {
      element = React.createElement(
        Placeholder,
        {
          iconName: 'Edit',
          iconText: this.title,
          description: strings.PropertyPaneDescription,
          buttonLabel: 'Configure',
          hideButton: this.displayMode == DisplayMode.Read,
          onConfigure: () => this.context.propertyPane.open()
        });
    }
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
    const viewFields: IViewField[] = isArray(this.properties.viewFields)
      ? this.properties.viewFields : [];
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
                new PropertyPaneAsyncDropdown('listId', {
                  label: strings.ListFieldLabel,
                  placeholder: "Select list...",
                  loadOptions: this.loadLists.bind(this),
                  onPropertyChange: this.onCustomPropertyPaneFieldChanged.bind(this),
                  selectedKey: this.properties.listId
                }),
                new PropertyPaneViewFieldList('viewFields', {
                  label: strings.ViewFieldsFieldLabel,
                  listId: this.properties.listId,
                  items: viewFields,
                  columns: [],
                  onPropertyChange: this.onCustomPropertyPaneFieldChanged.bind(this),
                  noItemsMessage: "Click on 'Add' to add fields."
                }),
              ]
            }
          ]
        }
      ]
    };
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

  private onPropertyChange(propertyPath: string, newValue: any, index?: number): void {
    // store new value in web part properties
    update(this.properties, propertyPath, (): any => { return newValue; });
    // refresh web part
    this.render();
  }

  private onCustomPropertyPaneFieldChanged(targetProperty: string, newValue: any) {
    const oldValue = this.properties[targetProperty];

    if (oldValue !== newValue) {
      this.properties[targetProperty] = newValue;

      if (targetProperty === "listId") {      
      
        update(this.properties, "viewFields", (): any => { return []; });
      }

      this.onPropertyPaneFieldChanged(targetProperty, oldValue, newValue);

      // NOTE: in local workbench onPropertyPaneFieldChanged method initiates re-render
      // in SharePoint environment we need to call re-render by ourselves
      //if (Environment.type !== EnvironmentType.Local) {
        this.render();
      //}

      this.context.propertyPane.refresh();
    }
  } 
}
