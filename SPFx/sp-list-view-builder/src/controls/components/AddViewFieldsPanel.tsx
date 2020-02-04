import * as React from 'react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';

import { IListViewBuilderProps } from '../../webparts/listViewBuilder/components/IListViewBuilderProps';

import { Panel } from 'office-ui-fabric-react/lib/Panel';

import { Stack, IDropdownOption } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import {
  DetailsList, DetailsListLayoutMode, Selection, IColumn
} from 'office-ui-fabric-react/lib/DetailsList';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/views";
import "@pnp/sp/fields";
import { isArray } from '@pnp/common';

import { FieldTypes, IFieldInfo, IField } from "@pnp/sp/fields";

import { IViewField, DataType } from '../../webparts/listViewBuilder/IConfiguration';
import AsyncDropdown from './AsyncDropdown';

interface IFieldLookupInfo extends IFieldInfo {
  AllowMultipleValues: boolean;
}

interface IFieldUserInfo extends IFieldLookupInfo {
}

interface IFieldMultiLineTextInfo extends IFieldInfo {
  RichText: boolean;
}

interface IFieldDateInfo extends IFieldInfo {
  DisplayFormat: number;
}

export class AddViewFieldsPanel extends React.Component<{
  listId: string,
  isOpen?: boolean,
  onFieldsAdded: (fields: IViewField[]) => void
}, {
  viewId?: string,
  isOpen?: boolean
}> {

  private _fields: { [viewId: string]: IViewField[] } = {};
  private _selection: Selection;

  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen
    };

    this._selection = new Selection({
    });
  }

  componentDidUpdate(prevProps: { listId: string, isOpen?: boolean }) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen });
    }
    if (prevProps.listId !== this.props.listId) {
      this.setState({ viewId: null });
    }
  }

  public render(): React.ReactElement<IListViewBuilderProps> {
    const { listId } = this.props;
    const { isOpen, viewId } = this.state;
    const fields = !!viewId ? this._fields[viewId] : null;

    return (
      <Panel isLightDismiss isOpen={isOpen} onDismiss={() => this.close()} closeButtonAriaLabel={"Close"} headerText={"Add Field(s)..."}
        onRenderFooterContent={this.onRenderFooterContent}
        isFooterAtBottom={false}>
        <Stack tokens={{ childrenGap: 40 }}>
          <Stack.Item>
            <span>{"View:"}</span>
            <AsyncDropdown loadOptions={() => this.loadViews(listId)} onChanged={this.onViewChanged.bind(this)} selectedKey={viewId} />
            <Separator></Separator>
          </Stack.Item>
          {fields &&
            (<Stack.Item>
              <span>{"Fields:"}</span>
              <DetailsList
                items={fields || []}
                columns={[
                  { key: 'title', name: 'Title', fieldName: 'Title', minWidth: 100, maxWidth: 200, isResizable: true },
                  { key: 'name', name: 'Name', fieldName: 'Name', minWidth: 100, maxWidth: 150, isResizable: true },
                  //{ key: 'dataType', name: 'Data Type', fieldName: 'DataType', minWidth: 50, maxWidth: 100, isResizable: true }
                ]}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selection={this._selection}
                selectionPreservedOnEmptyClick={true}
              />
            </Stack.Item>)
          }
        </Stack>
      </Panel>
    );
  }

  public open() {
    if (!this.state.isOpen) {
      this.setState({ isOpen: true });
    }
  }

  public close() {
    if (this.state.isOpen) {
      this.setState({ isOpen: false });
    }
  }

  private onRenderFooterContent = () => {
    //const { isOpen, viewId } = this.state;
    //const fields = !!viewId ? this._fields[viewId] : null;
    return (<div>
      <PrimaryButton onClick={() => {
        this.close();
        if (typeof this.props.onFieldsAdded === "function") {
          const fields = this._selection.getSelection() as IViewField[];
          this.props.onFieldsAdded(fields);
        }
      }} styles={{ root: { marginRight: 8 } }}>
        {"Add"}
      </PrimaryButton>
      <DefaultButton onClick={() => this.close()}>{"Cancel"}</DefaultButton>
    </div>);
  }

  private loadViews(listId: string): Promise<IDropdownOption[]> {
    return new Promise<IDropdownOption[]>((resolve: (options: IDropdownOption[]) => void, reject: (error: any) => void) => {
      try {
        return sp.web.lists.getById(listId).views.filter('Hidden eq false').get()
          .then((views) => {
            let options = views.map((v) => ({ key: v.Id, text: v.Title }) as IDropdownOption);
            resolve(options);
          }).catch(e => {
            reject(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  }

  private loadViewFields(listId: string, viewId: string): Promise<string[]> {
    return new Promise<string[]>((resolve: (options: string[]) => void, reject: (error: any) => void) => {
      try {
        return sp.web.lists.getById(listId).getView(viewId).fields.select('Items').get()
          .then(f => {
            const fields = (f as any).Items.results || (f as any).Items;
            resolve(fields as string[]);
          }).catch(e => {
            reject(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  }

  private loadFields(listId: string, fieldNames: string[]): Promise<IViewField[]> {
    return new Promise<IViewField[]>((resolve: (options: IViewField[]) => void, reject: (error: any) => void) => {
      try {
        return sp.web.lists.getById(listId).fields.select('InternalName', 'Title', 'FieldTypeKind', 'AllowMultipleValues', 'RichText', 'DisplayFormat').filter(`${
          fieldNames.map(field => `InternalName eq '${field}'`).join(' or ')
          }`).get()
          .then(fields => {
            let viewFields = fields.map(f => ({ Name: f.InternalName, Title: f.Title, DataType: this.get_DataType(f) }) as IViewField);
            viewFields.sort(function (a, b) {
              return fieldNames.indexOf(a.Name) - fieldNames.indexOf(b.Name);
            });
            resolve(viewFields);
          }).catch(e => {
            reject(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  }

  private get_DataType(field: IFieldInfo): DataType {
    switch (field.FieldTypeKind) {
      case FieldTypes.Boolean:
      case FieldTypes.Recurrence:
      case FieldTypes.AllDayEvent:
        return DataType.Boolean;
      case FieldTypes.Choice:
        return DataType.Choice;
      case FieldTypes.DateTime:
        if ((field as IFieldDateInfo).DisplayFormat === 0) {
          return DataType.Date;
        }
        return DataType.DateTime;
      case FieldTypes.Lookup:
        if ((field as IFieldLookupInfo).AllowMultipleValues) {
          return DataType.MultiLookup;
        }
        return DataType.Lookup;
      case FieldTypes.MultiChoice:
        return DataType.MultiChoice;
      case FieldTypes.Number:
      case FieldTypes.Integer:
      case FieldTypes.Counter:
        return DataType.Number;
      case FieldTypes.Note:
        if ((field as IFieldMultiLineTextInfo).RichText) {
          return DataType.RichText;
        }
        return DataType.MultiLineText;
      case FieldTypes.User:
        if ((field as IFieldLookupInfo).AllowMultipleValues) {
          return DataType.MultiUser;
        }
        return DataType.User;
      default: return DataType.Text;
    }
  }

  private onViewChanged(option: IDropdownOption, index?: number): void {
    const { listId } = this.props;
    const viewId = option.key as string;
    if (viewId !== this.state.viewId) {
      if (isArray(this._fields[viewId])) {
        this.setState({ viewId: viewId });
        return;
      }
      this.loadViewFields(listId, option.key as string)/*.then((fields) => this.setState({ fields: fields }))*/
        .then((fields) => this.loadFields(listId, fields)).then((fields) => {
          this._fields[option.key] = fields;
          this.setState({ viewId: viewId });
        });
    }
  }
}
