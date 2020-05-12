import * as React from 'react';

import { getTheme, Stack, IDropdownOption, Spinner, SpinnerSize, DefaultButton, PrimaryButton, Panel, Separator, DetailsList, DetailsRow, IDetailsRowProps, IDetailsRowStyles, DetailsListLayoutMode, Selection } from 'office-ui-fabric-react' /* '@fluentui/react'*/;

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import { isArray } from '@pnp/common';
import { FieldTypes, IFieldInfo } from "@pnp/sp/fields";
import { IFieldLookupInfo, IFormField } from '../../../utilities/Entities';
import { AsyncDropdown } from '../../../controls/components/asyncDropdown';
import SPService from '../../../utilities/SPService';
import { IList } from '@pnp/sp/lists';

const theme = getTheme();

export interface IAddFormFieldPanelProps {
  list: IList;
  isOpen?: boolean;
  fields: IFormField[];
  onAddFields: (fields: IFormField[]) => void;
}

export interface IAddFormFieldPanelState {
  contentTypeId?: string;
  isOpen?: boolean;
  selection?: IFormField[];
  isLoading?: boolean;
}

export default class AddFormFieldPanel extends React.Component<IAddFormFieldPanelProps, IAddFormFieldPanelState> {

  private _fields: { [contentTypeId: string]: IFormField[] } = {};
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
        const selection: IFormField[] = fields instanceof Array && fields.length > 0
          ? (this._selection.getSelection() as IFormField[]).filter(f => !fields.some(ff => ff.Name === f.Name))
          : this._selection.getSelection() as IFormField[];
        this.setState({ selection: selection });
      }
    });
  }

  public componentDidUpdate(prevProps: IAddFormFieldPanelProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen });
    }
    if (prevProps.list !== this.props.list) {
      this.setState({ contentTypeId: null });
    }
  }

  public render(): React.ReactElement {
    const { list } = this.props;
    const { isOpen, contentTypeId, isLoading } = this.state;
    const fields = !!contentTypeId ? this._fields[contentTypeId] : null;

    return (
      <Panel isLightDismiss isOpen={isOpen} onDismiss={() => this.close()} closeButtonAriaLabel={"Close"} headerText={"Add Field(s)..."}
        onRenderFooterContent={this.renderFooterContent.bind(this)}
        isFooterAtBottom={false}>
        <Stack tokens={{ childrenGap: 2 }}>
          <Stack.Item>
            <AsyncDropdown label={"Content Type"} placeholder={"Select a content type..."} options={() => this.loadContentTypes(list)} onChange={this.onContentTypeChanged.bind(this)} selectedKey={contentTypeId} />
            <Separator></Separator>
          </Stack.Item>
          <Stack.Item>
            {isLoading && <Spinner size={SpinnerSize.large} />}
            {!isLoading && !!contentTypeId && <DetailsList
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
          const formFields: IFormField[] = fields instanceof Array && fields.length > 0
            ? selection.filter(f => !fields.some(ff => ff.Name === f.Name))
            : selection;
          this.props.onAddFields(formFields);
        }
      }} styles={{ root: { marginRight: 8 } }}>
        {"Add"}
      </PrimaryButton>
      <DefaultButton onClick={() => this.close()}>{"Cancel"}</DefaultButton>
    </div>);
  }

  private loadContentTypes(list: IList): Promise<IDropdownOption[]> {
    return new Promise<IDropdownOption[]>((resolve: (options: IDropdownOption[]) => void, reject: (error: any) => void) => {
      try {
        return list.contentTypes.filter('Hidden eq false').get()
          .then((contentTypes) => {
            const options = contentTypes.map((ct) => ({ key: ct.Id.StringValue, text: ct.Name }) as IDropdownOption);
            resolve(options);
          }).catch(e => {
            reject(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  }

  private loadContentTypeFields(list: IList, contentTypeId: string): Promise<IFormField[]> {
    return new Promise<IFormField[]>((resolve: (options: IFormField[]) => void, reject: (error: any) => void) => {
      try {
        return list.contentTypes.getById(contentTypeId).fields.filter('Hidden eq false')/*.orderBy('Title')*/.select('Id', 'InternalName', 'EntityPropertyName', 'Title', 'Description', 'FieldTypeKind', 'AllowMultipleValues', 'Required', 'ReadOnlyField', 'RichText', 'DisplayFormat', 'LookupField', 'LookupList', 'LookupWebId', 'IsRelationship', 'PrimaryFieldId'/*, 'SchemaXml'*/).get()
          .then(fields => {
            const formFields = fields.map(f => this.get_Field(f, fields));
            resolve(formFields);
          }).catch(e => {
            reject(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  }

  private get_Field(field: IFieldInfo, fields: IFieldInfo[]): IFormField {
    let formField = { Id: field.Id, Name: field.EntityPropertyName || field.InternalName, Title: field.Title, Description: field.Description, DataType: SPService.get_DataType(field), Required: field.Required, ReadOnly: field.ReadOnlyField } as IFormField;
    if (field.FieldTypeKind === FieldTypes.Lookup || field.FieldTypeKind === FieldTypes.User) {
      const lookupField = field as IFieldLookupInfo;
      if (lookupField.PrimaryFieldId) {
        const primaryField = fields.filter(f => f.Id === lookupField.PrimaryFieldId);
        formField = ({
          ...formField,
          LookupFieldName: lookupField.LookupField,
          LookupListId: lookupField.LookupList,
          LookupWebId: lookupField.LookupWebId,
          PrimaryFieldName: primaryField.length > 0 ? primaryField[0].EntityPropertyName || primaryField[0].InternalName : undefined
        }) as IFormField;
      }
      else {
        formField = ({
          ...formField,
          LookupFieldName: lookupField.LookupField,
          LookupListId: lookupField.LookupList,
          LookupWebId: lookupField.LookupWebId,
        }) as IFormField;
      }
    }
    return formField;
  }

  private onContentTypeChanged(option: IDropdownOption, index?: number): void {
    const { list } = this.props;
    const contentTypeId = option.key as string;
    if (contentTypeId !== this.state.contentTypeId) {
      if (isArray(this._fields[contentTypeId])) {
        this.setState({ contentTypeId: contentTypeId });
        return;
      }
      this.setState({ isLoading: true });
      this.loadContentTypeFields(list, option.key as string)
        .then((formFields) => {
          this._fields[option.key] = formFields;
          this.setState({ contentTypeId: contentTypeId, isLoading: false });
        }).catch(_ => this.setState({ isLoading: false }));
    }
  }
}
