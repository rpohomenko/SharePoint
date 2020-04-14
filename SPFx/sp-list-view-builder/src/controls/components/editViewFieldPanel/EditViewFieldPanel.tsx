import * as React from 'react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';

import styles from "./editViewField.module.scss";

import { Panel } from 'office-ui-fabric-react/lib/Panel';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Stack, Dropdown, IDropdownOption, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/views";
import "@pnp/sp/fields";
import { isEqual } from '@microsoft/sp-lodash-subset';
import { IViewField, IViewLookupField, DataType } from '../../../webparts/listViewBuilder/components/spListView/ISPListView';
import { IEditViewFieldProps, IEditViewFieldState } from './IEditViewFieldProps';

import { getTheme } from 'office-ui-fabric-react/lib/Styling';

const theme = getTheme();

export class EditViewFieldPanel extends React.Component<IEditViewFieldProps, IEditViewFieldState> {

  constructor(props) {
    super(props);
    this.state = {
      field: { ...props.field },     
      isOpen: props.isOpen
    };
  }

  public componentDidUpdate(prevProps: IEditViewFieldProps) {
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
      <Panel className={styles.editViewField} isLightDismiss isOpen={isOpen} onDismiss={() => this.close()} closeButtonAriaLabel={"Close"} headerText={`Edit: ${field.Title}`}
        onRenderFooterContent={this.renderFooterContent.bind(this)}
        isFooterAtBottom={true}>
        <Stack horizontal={false} tokens={{ childrenGap: 15 }}>
          <TextField label={"Title"} required placeholder={field.Title} value={changedField.Title} onChange={(event, value) => {
            changedField.Title = value; /*|| field.Title;*/
            this.setState({ isChanged: !!value && changedField.Title !== field.Title, changedField: changedField });
          }} />
          <Separator></Separator>
          { (field.DataType === DataType.Lookup || field.DataType === DataType.MultiLookup) && <Dropdown
            label="Field Type"
            options={[
              { key: DataType.Boolean.toString(), text: 'Boolean' },
              { key: DataType.Date.toString(), text: 'Date' },
              { key: DataType.DateTime.toString(), text: 'DateTime' },
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
