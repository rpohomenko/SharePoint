import * as React from 'react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import styles from "./formFieldEditor.module.scss";

import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Stack, Dropdown, IDropdownOption, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/views";
import "@pnp/sp/fields";
import { isEqual } from '@microsoft/sp-lodash-subset';
import { IFormField, DataType } from '../../../../utilities/Entities';
import { IFormFieldEditorProps, IFormFieldEditorState } from './IFormFieldEditorProps';

import { getTheme } from 'office-ui-fabric-react/lib/Styling';

const theme = getTheme();

export class FormFieldEditor extends React.Component<IFormFieldEditorProps, IFormFieldEditorState> {

  constructor(props) {
    super(props);
    this.state = {
      field: { ...props.field },     
      isOpen: props.isOpen
    };
  }

  public componentDidUpdate(prevProps: IFormFieldEditorProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen });
    }
    if (!isEqual(prevProps.field, this.props.field)) {
      this.setState({ field: this.props.field });
    }
  }

  public render(): React.ReactElement {
    const { isOpen, field } = this.state;
    const changedField = this.state.changedField || { ...field };
    if (!field) return null;
    return (
      <Panel className={styles.formFieldEditor} isLightDismiss isOpen={isOpen} onDismiss={() => this.close()} closeButtonAriaLabel={"Close"} headerText={`Edit: ${field.Title}`}
        onRenderFooterContent={this.renderFooterContent.bind(this)}
        isFooterAtBottom={false}>
        <Stack horizontal={false} tokens={{ childrenGap: 15 }}>
          <TextField label={"Title"} required placeholder={field.Title} value={changedField.Title} onChange={(event, value) => {
            changedField.Title = value;
            this.setState({ isChanged: !!value && changedField.Title !== field.Title, changedField: changedField });
          }} />
          <Toggle label="Required" checked={changedField.Required === true} onChange={(event, checked) => {
            changedField.Required = checked;
            this.setState({ isChanged: changedField.Required !== field.Required, changedField: changedField });
          }} />
          { (field.DataType === DataType.Lookup || field.DataType === DataType.MultiLookup) && <Dropdown
            label="Field Type"
            options={[
              { key: DataType.Boolean.toString(), text: 'Boolean' },
              { key: DataType.Date.toString(), text: 'Date' },
              { key: DataType.DateTime.toString(), text: 'Date Time' },
              { key: DataType.Number.toString(), text: 'Number' },
              { key: DataType.Text.toString(), text: 'Text' }
            ]}
            //defaultSelectedKey={DataType.Text.toString()}
            selectedKey={changedField.OutputType ? changedField.OutputType.toString() : DataType.Text.toString()}
            onChange={(event, option, index) => {
              changedField.OutputType = Number(option.key);
              this.setState({ isChanged: changedField.OutputType !== field.OutputType, changedField: changedField });
            }}
          />
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
      this.setState({ isOpen: false, isChanged: false, changedField: undefined });
    }
  }

  private renderFooterContent = () => {
    const { isChanged, field, changedField } = this.state;
    return (<div>
      <PrimaryButton disabled={!isChanged} onClick={() => {
        changedField.Title = changedField.Title || field.Title;
        this.setState({ isChanged: false, changedField: undefined });
        this.close();
        if (this.props.onChange instanceof Function) {
          this.props.onChange(changedField);
        }
      }} styles={{ root: { marginRight: 8 } }}>
        {"Save"}
      </PrimaryButton>
      <DefaultButton onClick={() => this.close()}>{"Cancel"}</DefaultButton>
    </div>);
  }
}
