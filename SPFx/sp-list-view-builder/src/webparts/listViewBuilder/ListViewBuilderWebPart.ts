import * as React from 'react';
import * as ReactDom from 'react-dom';
import { DisplayMode, Environment, EnvironmentType, Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneSlider,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { FieldTypes, IFieldInfo } from "@pnp/sp/fields";
import { Placeholder } from "@pnp/spfx-controls-react/lib/Placeholder";
import * as strings from 'ListViewBuilderWebPartStrings';

import { PropertyFieldListPicker } from '../propertyPaneField/propertyFieldListPicker';
import { ListOrderBy, ISPListInfo } from "../../controls/components/listPicker";
import { PropertyPaneViewFieldList } from '../propertyPaneField/PropertyPaneViewFieldList';
import { PropertyPaneFieldPicker } from '../propertyPaneField/propertyPaneFieldPicker';
import { IViewField, IFolder, IField, IOrderByField, IFieldLookupInfo } from '../../utilities/Entities';
import { update, get } from '@microsoft/sp-lodash-subset';
import { proxyUrl, webRelativeUrl } from '../../settings';
import { SPListView } from './components/spListView';
import SPService from '../../utilities/SPService';
import { isEqual } from '@microsoft/sp-lodash-subset';

export interface IListViewBuilderWebPartProps {
  description: string;
  list: ISPListInfo;
  viewFields: IViewField[];
  countPerPage?: number;
  cachingTimeoutSeconds?: number;
  includeSubFolders?: boolean;
  ascending?: boolean;
  orderBy?: IField;
}

export default class ListViewBuilderWebPart extends BaseClientSideWebPart<IListViewBuilderWebPartProps> {

  private _locale: string;
  private _webAbsoluteUrl: string;
  private _webRelativeUrl: string;

  public render(): void {

    const inDesignMode: boolean = this.displayMode === DisplayMode.Edit;
    //const environmentType: EnvironmentType = Environment.type;

    let element: React.ReactElement;
    if (!!this.properties.list && this.properties.viewFields instanceof Array && this.properties.viewFields.length > 0) {
      element = React.createElement(
        SPListView,
        {
          list: SPService.getList(this.properties.list),
          viewFields: this.properties.viewFields,
          count: this.properties.countPerPage,
          timeZone: SPService.getTimeZoneInfo(),
          regionalSettings: SPService.getRegionalSettingsInfo(),
          includeSubFolders: this.properties.includeSubFolders,
          showFolders: !this.properties.includeSubFolders,
          rootFolder: !this.properties.includeSubFolders ? { Name: this.properties.list.Title, ServerRelativeUrl: this.properties.list.Url } as IFolder : undefined,
          orderBy: this.properties.orderBy ? [{ Name: this.properties.orderBy.Name, Descending: !this.properties.ascending } as IOrderByField] : undefined,
          
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
  protected async onInit(): Promise<void> {
    await super.onInit();
    const isIE11 = !!(<any>window).MSInputMethodContext && !!(<any>document).documentMode;
    if (this.properties.cachingTimeoutSeconds === undefined) {
      this.properties.cachingTimeoutSeconds = 0;
    }
    if (this.properties.countPerPage === undefined) {
      this.properties.countPerPage = 30;
    }
    if (this.properties.includeSubFolders === undefined) {
      this.properties.includeSubFolders = false;
    }
    if (this.properties.ascending === undefined) {
      this.properties.ascending = true;
    }
    if (Environment.type == EnvironmentType.Local) {
      this._webRelativeUrl = webRelativeUrl;
      this._webAbsoluteUrl = `${proxyUrl}${this._webRelativeUrl}`;
      sp.setup({
        ie11: isIE11,
        defaultCachingStore: "session", // or "local"
        defaultCachingTimeoutSeconds: this.properties.cachingTimeoutSeconds || 30,
        globalCacheDisable: this.properties.cachingTimeoutSeconds === 0,
        spfxContext: this.context,
        sp: {
          headers: {
            Accept: "application/json;odata=verbose",
          },
          baseUrl: this._webAbsoluteUrl
        },
      });
    }
    else {
      this._locale = this.context.pageContext.cultureInfo.currentUICultureName;
      this._webAbsoluteUrl = this.context.pageContext.web.absoluteUrl;
      this._webRelativeUrl = this.context.pageContext.web.serverRelativeUrl;
      sp.setup({
        ie11: isIE11,
        defaultCachingStore: "session", // or "local"
        defaultCachingTimeoutSeconds: this.properties.cachingTimeoutSeconds || 30,
        globalCacheDisable: this.properties.cachingTimeoutSeconds === 0,
        spfxContext: this.context,
        sp: {
          headers: {
            Accept: "application/json;odata=verbose",
          },
          baseUrl: this._webAbsoluteUrl
        }
      });
    }
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
                PropertyFieldListPicker('list', {
                  label: strings.ListFieldLabel,
                  selectedList: this.properties.list,
                  includeHidden: false,
                  orderBy: ListOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onCustomPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  web: sp.web,
                  placeHolder: "Select a list...",
                  key: 'listPicker'
                }),
                new PropertyPaneViewFieldList('viewFields', {
                  label: strings.ViewFieldsFieldLabel,
                  listId: this.properties.list ? this.properties.list.Id : undefined,
                  items: this.properties.viewFields,                
                  columns: [],
                  onPropertyChange: this.onCustomPropertyPaneFieldChanged.bind(this),
                  noItemsMessage: "Click on 'Add' to add fields."
                }),
                new PropertyPaneFieldPicker('orderBy', {
                  label: strings.OrderByLabel,
                  placeholder: "Select a field...",
                  itemLimit: 1,
                  disabled: !this.properties.list,
                  selected: this.properties.orderBy ? [this.properties.orderBy] : undefined,
                  list: SPService.getList(this.properties.list),
                  onPropertyChange: this.onCustomPropertyPaneFieldChanged.bind(this),
                  onFilter: (field) => {
                    return !(field as IFieldLookupInfo).AllowMultipleValues && field.FieldTypeKind !== FieldTypes.MultiChoice
                      && field.FieldTypeKind !== FieldTypes.Note;
                  }
                }),
                PropertyPaneToggle('ascending', {
                  label: strings.AscendingLabel,
                  disabled: !this.properties.orderBy
                }),
              ]
            },
            {
              groupName: strings.AdvancedGroupName,
              groupFields: [
                PropertyPaneSlider('countPerPage', {
                  label: strings.CountPerPageLabel,
                  min: 0,
                  max: 100
                }),
                PropertyPaneToggle('includeSubFolders', {
                  label: strings.IncludeSubFolderLabel
                }),
                PropertyPaneSlider('cachingTimeoutSeconds', {
                  label: strings.CachingTimeoutSecondsLabel,
                  min: 0,
                  max: 30 * 60
                }),
              ]
            }
          ]
        }
      ]
    };
  }  

  private onPropertyChange(propertyPath: string, newValue: any, index?: number): void {
    // store new value in web part properties
    update(this.properties, propertyPath, (): any => { return newValue; });
    // refresh web part
    this.render();
  }

  private onCustomPropertyPaneFieldChanged(targetProperty: string, newValue: any) {
    const oldValue = this.properties[targetProperty];

    if (!isEqual(oldValue, newValue)) {
      this.properties[targetProperty] = newValue;

      if (targetProperty === "list") {
        update(this.properties, "orderBy", (): any => { return undefined; });
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
