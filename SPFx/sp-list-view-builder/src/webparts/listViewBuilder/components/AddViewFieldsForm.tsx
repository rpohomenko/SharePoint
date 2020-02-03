import * as React from 'react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';

import { IListViewBuilderProps } from './IListViewBuilderProps';

import { Panel } from 'office-ui-fabric-react/lib/Panel';

import { DefaultButton, Stack, IDropdownOption } from 'office-ui-fabric-react';
import {
  DetailsList, DetailsListLayoutMode, Selection, IColumn
} from 'office-ui-fabric-react/lib/DetailsList';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/views";
import "@pnp/sp/fields";

import { IViewField } from '../IConfiguration';
import AsyncDropdown from '../../../controls/components/AsyncDropdown';

export class AddViewFieldsForm extends React.Component<{
  listId: string,
  isOpen?: boolean
}, {
  fields: Array<IViewField> | string[],
  isOpen?: boolean
}> {
  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      isOpen: props.isOpen
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen });
    }
  }


  public render(): React.ReactElement<IListViewBuilderProps> {
    const { listId } = this.props;
    const { isOpen, fields } = this.state;

    return (

      <Panel isLightDismiss isOpen={isOpen} onDismiss={() => this.setState({ isOpen: false })} closeButtonAriaLabel="Close" headerText={"Add View Fields"}>

        <Stack tokens={{ childrenGap: 40 }}>
          <Stack.Item>
            <span>{"View:"}</span>
            <AsyncDropdown loadOptions={() => this.loadViews(listId)} onChanged={this.onViewChanged.bind(this)} />
            <Separator></Separator>
          </Stack.Item>
          <Stack.Item>
            <span>{"Fields:"}</span>
            <>
              <DetailsList
                items={fields || []}
                columns={[
                  { key: 'title', name: 'Title', fieldName: 'Title', minWidth: 100, maxWidth: 200, isResizable: true },
                  { key: 'name', name: 'Name', fieldName: 'Name', minWidth: 100, maxWidth: 200, isResizable: true }
                ]}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selectionPreservedOnEmptyClick={true}
              />
            </>
          </Stack.Item>
        </Stack>
      </Panel>
    );
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
        return sp.web.lists.getById(listId).fields.select('InternalName', 'Title').filter(`${
          fieldNames.map(field => `InternalName eq '${field}'`).join(' or ')
          }`).get()
          .then(fields => {
            let viewFields = fields.map(f => ({ Name: f.InternalName, Title: f.Title }) as IViewField);
            resolve(viewFields);
          }).catch(e => {
            reject(e.message);
          });
      } catch (error) {
        alert(error);
      }
    });
  }

  private onViewChanged(option: IDropdownOption, index?: number): void {
    const { listId } = this.props;
    this.loadViewFields(listId, option.key as string)/*.then((fields) => this.setState({ fields: fields }))*/
    .then((fields) => this.loadFields(listId, fields)).then((fields) => this.setState({ fields: fields }));
  }
}
