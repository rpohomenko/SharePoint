import * as React from 'react';

import {
  Panel, Separator, Stack, IDropdownOption, Spinner, SpinnerSize, DefaultButton, PrimaryButton, getTheme,
  DetailsList, DetailsRow, IDetailsRowProps, IDetailsRowStyles, DetailsListLayoutMode, Selection
} from 'office-ui-fabric-react' /* '@fluentui/react'*/;

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/views";
import "@pnp/sp/fields";
import { isArray } from '@pnp/common';

import { FieldTypes, IFieldInfo } from "@pnp/sp/fields";
import { IViewField, IViewLookupField, IFieldLookupInfo, IFieldUserInfo } from '../../../utilities/Entities';
import { AsyncDropdown } from '../../../controls/components/asyncDropdown';
import SPService from '../../../utilities/SPService';
import { IList } from '@pnp/sp/lists';

const theme = getTheme();

export interface IAddViewFieldPanelProps {
  list: IList;
  isOpen?: boolean;
  fields: IViewField[];
  onAddFields: (fields: IViewField[]) => void;
}

export interface IAddViewFieldPanelState {
  viewId?: string;
  isOpen?: boolean;
  selection?: IViewField[];
  isLoading?: boolean;
}

export default class AddViewFieldPanel extends React.Component<IAddViewFieldPanelProps, IAddViewFieldPanelState> {

  private _fields: { [viewId: string]: IViewField[] } = {};
  private _selection: Selection;

  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen,
      selection: []
    };

    this._selection = new Selection({
      onSelectionChanged: () => {
        const { fields } = this.props;
        const selection: IViewField[] = fields instanceof Array && fields.length > 0
          ? (this._selection.getSelection() as IViewField[]).filter(f => !fields.some(ff => ff.Name === f.Name))
          : this._selection.getSelection() as IViewField[];
        this.setState({ selection: selection });    
      }
    });
  }

  public componentDidUpdate(prevProps: IAddViewFieldPanelProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen });
    }
    if (prevProps.list !== this.props.list) {
      this.setState({ viewId: null });
    }
  }

  public render(): React.ReactElement {
    const { list } = this.props;
    const { isOpen, viewId, isLoading } = this.state;
    const fields = !!viewId ? this._fields[viewId] : null;

    return (
      <Panel isLightDismiss isOpen={isOpen} onDismiss={() => this.close()} closeButtonAriaLabel={"Close"} headerText={"Add Field(s)..."}
        onRenderFooterContent={this.renderFooterContent.bind(this)}
        isFooterAtBottom={false}>
        <Stack tokens={{ childrenGap: 2 }}>
          <Stack.Item>
            <AsyncDropdown label={"View"} placeholder={"Select a list view..."} options={() => this.loadViews(list)} onChange={this.onViewChanged.bind(this)} selectedKey={viewId} />
            <Separator></Separator>
          </Stack.Item>
          <Stack.Item>
            {isLoading && <Spinner size={SpinnerSize.large} />}
            {!isLoading && !!viewId && <DetailsList
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
              onRenderRow={this.renderRow.bind(this)}
            />}
          </Stack.Item>
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

  private renderRow(props: IDetailsRowProps) {
    const customStyles: Partial<IDetailsRowStyles> = {};
    let selectionDisabled = false;
    if (props) {
      const fields = this.props.fields;
      if (fields instanceof Array) {
        if (fields.some(f => SPService.compareFieldNames(f.Name, props.item.Name))) {
          customStyles.root = { backgroundColor: theme.palette.themeLighter };
          selectionDisabled = true;
          //props.checkboxVisibility= CheckboxVisibility.always;
        }
      }
    }

    return (
      <span data-selection-disabled={selectionDisabled}>
        <DetailsRow {...props} styles={customStyles} />
      </span>
    );
  }

  private renderFooterContent = () => {
    const { selection } = this.state;

    return (<div>
      <PrimaryButton disabled={selection.length === 0} onClick={() => {
        this._selection.setItems([], true);
        this.close();
        if (this.props.onAddFields instanceof Function) {
          const { fields } = this.props;
          const viewFields: IViewField[] = fields instanceof Array && fields.length > 0
            ? selection.filter(f => !fields.some(ff => ff.Name === f.Name))
            : selection;
          this.props.onAddFields(viewFields);
        }
      }} styles={{ root: { marginRight: 8 } }}>
        {"Add"}
      </PrimaryButton>
      <DefaultButton onClick={() => this.close()}>{"Cancel"}</DefaultButton>
    </div>);
  }

  private loadViews(list: IList): Promise<IDropdownOption[]> {
    return new Promise<IDropdownOption[]>((resolve: (options: IDropdownOption[]) => void, reject: (error: any) => void) => {
      try {
        return list.views.filter('Hidden eq false').get()
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

  private loadViewFields(list: IList, viewId: string): Promise<string[]> {
    return new Promise<string[]>((resolve: (options: string[]) => void, reject: (error: any) => void) => {
      try {
        return list.getView(viewId).fields.select('Items').get()
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

  private loadFields(list: IList, fieldNames: string[]): Promise<IViewField[]> {
    return new Promise<IViewField[]>((resolve: (options: IViewField[]) => void, reject: (error: any) => void) => {
      try {
        return list.fields.select('Id', 'InternalName', 'EntityPropertyName', 'Title', 'FieldTypeKind', 'AllowMultipleValues', 'RichText', 'DisplayFormat', 'LookupField', 'LookupList', 'LookupWebId', 'IsRelationship', 'PrimaryFieldId', 'Filterable'/*, 'SchemaXml'*/).filter(`${
          fieldNames.map(field => `InternalName eq '${field}'`).join(' or ')
          }`).get()
          .then(fields => {
            let viewFields = fields.map(f => this.get_Field(f, fields));
            viewFields.sort((a, b) => {
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

  private get_Field(field: IFieldInfo, fields: IFieldInfo[]): IViewField {
    let viewField = { Id: field.Id, Name: field.EntityPropertyName || field.InternalName, Title: field.Title, DataType: SPService.get_DataType(field), Sortable: this.is_Sortable(field), Filterable: this.is_Filterable(field) } as IViewField;
    if (field.FieldTypeKind === FieldTypes.Lookup || field.FieldTypeKind === FieldTypes.User) {
      const lookupField = field as IFieldLookupInfo;
      if (lookupField.PrimaryFieldId) {
        const primaryField = fields.filter(f => f.Id === lookupField.PrimaryFieldId);
        viewField = ({
          ...viewField,
          LookupFieldName: lookupField.LookupField,
          LookupListId: lookupField.LookupList,
          LookupWebId: lookupField.LookupWebId,
          PrimaryFieldName: primaryField.length > 0 ? primaryField[0].EntityPropertyName || primaryField[0].InternalName : undefined
        }) as IViewLookupField;
      }
      else {
        viewField = ({
          ...viewField,
          LookupFieldName: lookupField.LookupField,
          LookupListId: lookupField.LookupList,
          LookupWebId: lookupField.LookupWebId,       
        }) as IViewLookupField;
      }
    }
    return viewField;
  }

  private is_Sortable(field: IFieldInfo) {
    switch (field.FieldTypeKind) {
      case FieldTypes.Lookup:
        if ((field as IFieldLookupInfo).AllowMultipleValues) {
          return false;
        }
        return true;
      case FieldTypes.MultiChoice:
      case FieldTypes.Note:
      case FieldTypes.URL:
      case FieldTypes.Calculated:
        return false;
      case FieldTypes.User:
        if ((field as IFieldUserInfo).AllowMultipleValues) {
          return false;
        }
        return true;
      default: return true;
    }
  }

  private is_Filterable(field: IFieldInfo) {
    if(field.Filterable === false) return false;
    switch (field.FieldTypeKind) {
      case FieldTypes.Lookup:
        if ((field as IFieldLookupInfo).AllowMultipleValues) {
          return false;
        }
        return true;
      case FieldTypes.MultiChoice:
      case FieldTypes.Note:
      case FieldTypes.URL:
        return false;
      case FieldTypes.User:
        if ((field as IFieldUserInfo).AllowMultipleValues) {
          return false;
        }
        return true;
      default: return true;
    }
  }

  private onViewChanged(option: IDropdownOption, index?: number): void {
    const { list } = this.props;
    const viewId = option.key as string;
    if (viewId !== this.state.viewId) {
      if (isArray(this._fields[viewId])) {
        this.setState({ viewId: viewId });
        return;
      }
      this.setState({ isLoading: true });
      this.loadViewFields(list, option.key as string)
        .then((fieldNames) => this.loadFields(list, fieldNames)
          .then((viewFields) => {
            this._fields[option.key] = viewFields;
            this.setState({ viewId: viewId, isLoading: false });
          }).catch(_ => this.setState({ isLoading: false })))
        .catch(_ => this.setState({ isLoading: false }));
    }
  }
}
