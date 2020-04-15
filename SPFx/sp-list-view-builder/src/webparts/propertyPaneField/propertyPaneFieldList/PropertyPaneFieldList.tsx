import * as React from 'react';
import * as ReactDom from 'react-dom';
import styles from './PropertyPaneFieldList.module.scss';

import { IPropertyPaneField, PropertyPaneFieldType } from "@microsoft/sp-property-pane";
import { Stack } from 'office-ui-fabric-react/lib/components/Stack';
import { Separator } from 'office-ui-fabric-react/lib/components/Separator';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import {
  IDetailsListProps,
  DetailsList, DetailsListLayoutMode, Selection, IColumn,
  IDragDropEvents,
  IDragDropContext,
  IObjectWithKey
} from 'office-ui-fabric-react/lib/DetailsList';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { getTheme, mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import { isEqual } from '@microsoft/sp-lodash-subset';
import {IPropertyPaneFieldListProps, IPropertyPaneFieldListInternalProps} from './IPropertyPaneFieldListProps';

const theme = getTheme();
const dragEnterClass = mergeStyles({
  backgroundColor: theme.palette.neutralLight,
});

export class PropertyPaneListBuilder extends React.Component<{
  items: any[];
  columns: IColumn[];
  noItemsMessage: React.ReactElement | string;
  onChange?: (items: any[]) => void;
  onSelect?: (selection: any[]) => void;
  getCommandItems?: (items: any[], selection?: IObjectWithKey[]) => ICommandBarItemProps[];
}, {
  items: any[];
  selection?: IObjectWithKey[]
}> {
  private _selection: Selection;
  private _dragDropEvents: IDragDropEvents;
  private _draggedItem: any | undefined;
  private _draggedIndex: number;

  constructor(props) {
    super(props);

    this._selection = new Selection({
      onSelectionChanged: () => {
        const selection = this._selection.getSelection();
        this.setState({ selection: selection }, () => {
          if (this.props.onSelect instanceof Function) {
            this.props.onSelect(selection);
          }
        });
      }
    });
    this._dragDropEvents = this._getDragDropEvents();
    this._draggedIndex = -1;

    this.state = {
      items: props.items || []
    };
  }

  /**
    * Lifecycle hook when component did update after state or property changes
    * @param prevProps
    * @param prevState
    */
  public componentDidUpdate(prevProps, prevState): void {

    if (!isEqual(prevProps, this.props)) {
      // Reset the selected items
      if (this._selection) {
        this._selection.setItems(this.props.items || [], true);
      }
      this.setState({ items: this.props.items || [] });
    }
  }

  private renderCommandBar() {
    const commandItems = this.props.getCommandItems(this.state.items, this.state.selection);
    return <CommandBar items={commandItems} />;
  }

  public render(): JSX.Element {
    const commandBar = this.renderCommandBar();
    const element: React.ReactElement<IDetailsListProps> = React.createElement(DetailsList, {
      items: this.state.items,
      columns: this.props.columns,
      setKey: "set",
      layoutMode: DetailsListLayoutMode.justified,
      selectionPreservedOnEmptyClick: true,
      selection: this._selection,
      dragDropEvents: this._dragDropEvents
    });
    if (!(this.props.items instanceof Array) || this.props.items.length === 0) {
      return (<>{commandBar}<MarqueeSelection selection={this._selection}>{element}{this.props.noItemsMessage}</MarqueeSelection></>);
    }
    return <>{commandBar}<MarqueeSelection selection={this._selection}>{element}</MarqueeSelection></>;
  }

  private _getDragDropEvents(): IDragDropEvents {
    return {
      canDrop: (dropContext?: IDragDropContext, dragContext?: IDragDropContext) => {
        return true;
      },
      canDrag: (item?: any) => {
        return true;
      },
      onDragEnter: (item?: any, event?: DragEvent) => {
        // return string is the css classes that will be added to the entering element.
        return dragEnterClass;
      },
      onDragLeave: (item?: any, event?: DragEvent) => {
        return;
      },
      onDrop: (item?: any, event?: DragEvent) => {
        if (this._draggedItem) {
          const index = this.state.items.indexOf(item);
          if (index < this._draggedIndex) {
            this._insertBeforeItem(item);
          }
          else if (index > this._draggedIndex) {
            this._insertAfterItem(item);
          }
        }
      },
      onDragStart: (item?: any, itemIndex?: number, selectedItems?: any[], event?: MouseEvent) => {
        this._draggedItem = item;
        this._draggedIndex = itemIndex!;
      },
      onDragEnd: (item?: any, event?: DragEvent) => {
        this._draggedItem = undefined;
        this._draggedIndex = -1;
      },
    };
  }

  private _insertBeforeItem(item: any): void {
    const draggedItems = this._selection.isIndexSelected(this._draggedIndex)
      ? (this._selection.getSelection())
      : [this._draggedItem!];
   
    const items = this.state.items.filter(itm => draggedItems.indexOf(itm) === -1);
    const insertIndex = items.indexOf(item);
    items.splice(insertIndex, 0, ...draggedItems);

    this.setItems(items);
  }

  private _insertAfterItem(item: any): void {
    const draggedItems = this._selection.isIndexSelected(this._draggedIndex)
      ? (this._selection.getSelection())
      : [this._draggedItem!];
   
    const items = this.state.items.filter(itm => draggedItems.indexOf(itm) === -1);
    const insertIndex = items.indexOf(item);
    items.splice(insertIndex + 1, 0, ...draggedItems);

    this.setItems(items);
  }

  public setItems(items: any[]): void {
    this.setState({ items: items }, () => {
      if (this.props.onChange instanceof Function) {
        this.props.onChange(items);
      }
    });
  }
}

export class PropertyPaneFieldList implements IPropertyPaneField<IPropertyPaneFieldListProps> {
  public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneFieldListInternalProps;
  private elem: HTMLElement;
  protected selection: any[];

  constructor(targetProperty: string, properties: IPropertyPaneFieldListProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      key: properties.label,
      targetProperty: targetProperty,
      label: properties.label,
      items: properties.items,
      columns: properties.columns,
      onPropertyChange: properties.onPropertyChange,
      noItemsMessage: properties.noItemsMessage,
      onRender: this.onRender.bind(this)
    };
  }

  public render(): void {
    if (!this.elem) {
      return;
    }

    this.onRender(this.elem);
  }

  private onRender(elem: HTMLElement): void {
    if (!this.elem) {
      this.elem = elem;
    }
    const element: React.ReactElement<IDetailsListProps> = this.onRenderElement();
    ReactDom.render(<div className={styles.propertyPaneList}>
      <Stack tokens={{ childrenGap: 2 }}>
        <Stack.Item>
          <Separator />
        </Stack.Item>
        <Stack.Item>
          <span>{this.properties.label}</span>
          {element}
        </Stack.Item>
      </Stack>
    </div>, elem);
  }

  protected getCommandItems(items: any[], selection?: IObjectWithKey[]): ICommandBarItemProps[] {
    return [];
  }

  protected onRenderElement(): React.ReactElement {
    return <PropertyPaneListBuilder items={this.properties.items} columns={this.properties.columns}
    onSelect={this.onSelect.bind(this)}
    getCommandItems={this.getCommandItems.bind(this)}
      noItemsMessage={this.properties.noItemsMessage}
      onChange={(items) => {
        this.set_items(items);
      }} />;
  }

  protected onSelect(selection: any[]){
     this.selection = selection;
     this.onRenderElement();
  }

  public delete_items(...deletedItems: any[]): void {
    if (deletedItems instanceof Array && deletedItems.length > 0) {
      const items = this.properties.items.filter(it => deletedItems.indexOf(it) === -1);
      this.set_items(items);
    }
  }

  public set_items(items: any[]): void {
    this.properties.onPropertyChange(this.targetProperty, items);
  }
}