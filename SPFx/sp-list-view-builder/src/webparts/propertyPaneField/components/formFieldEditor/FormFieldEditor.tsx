import * as React from 'react';
import styles from "./formFieldEditor.module.scss";
import { Stack, Dropdown, DefaultButton, PrimaryButton, Panel, Toggle, TextField, getTheme } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/views";
import "@pnp/sp/fields";
import { isEqual } from '@microsoft/sp-lodash-subset';
import { DataType, FormMode } from '../../../../utilities/Entities';
import { IFormFieldEditorProps, IFormFieldEditorState } from './IFormFieldEditorProps';

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
    const changedField = this.state.changedField || { ...field, Modes: field.Modes instanceof Array ? [...field.Modes] : [] };
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
          <Toggle label="Required" disabled={changedField.ReadOnly === true} checked={changedField.Required === true} onChange={(event, checked) => {
            changedField.Required = checked;
            this.setState({ isChanged: changedField.Required !== field.Required, changedField: changedField });
          }} />
          {(field.DataType === DataType.Lookup || field.DataType === DataType.MultiLookup) && <Dropdown
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
              const isChanged = changedField.OutputType !== field.OutputType
                    && !(changedField.OutputType === DataType.Text && field.OutputType === undefined);
              this.setState({ isChanged: isChanged, changedField: changedField });
            }}
          />
          }
          <TextField
            label="Description"
            multiline={true}
            value={changedField.Description || ""}
            onChange={(event, value) => {
              changedField.Description = value;
              const isChanged = changedField.Description !== field.Description;
              this.setState({ isChanged: isChanged, changedField: changedField });
            }}
          />
          <Dropdown
            label="Mode"
            placeholder="Select..."
            multiSelect={true}
            options={[
              { key: FormMode.Display.toString(), text: 'Display' },
              { key: FormMode.Edit.toString(), text: 'Edit' },
              { key: FormMode.New.toString(), text: 'New' }
            ]}
            disabled={field.ReadOnly === true}
            selectedKeys={changedField.Modes instanceof Array ? changedField.Modes.map(mode => mode.toString()) : undefined}
            onChange={(event, option, index) => {
              let modes = changedField.Modes || [];
              const currentMode: FormMode = Number(option.key);
              let isChanged = false;
              if (modes.indexOf(currentMode) === -1) {
                if (option.selected === true) {
                  modes.push(currentMode);
                  isChanged = true;
                }
              }
              else {
                if (option.selected !== true) {
                  modes = modes.filter(mode => mode !== currentMode);
                  isChanged = true;
                }
              }
              changedField.Modes = modes;
              if (isChanged) {
                const prevModes = (field.Modes || []);
                isChanged = prevModes.length !== modes.length || prevModes.some(mode => modes.indexOf(mode) === -1);
                this.setState({ isChanged: isChanged, changedField: changedField });
              }
            }}
          />
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
