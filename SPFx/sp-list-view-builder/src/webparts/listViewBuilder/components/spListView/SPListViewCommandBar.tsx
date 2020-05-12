import * as React from 'react';
import { isEqual } from '@microsoft/sp-lodash-subset';
import { FormMode, IFormField, IEditableListItem } from '../../../../utilities/Entities';
import { cancelable, CancelablePromise } from 'cancelable-promise';
import { SPListView } from '../spListView';
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton, CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { SPListForm } from './SPListForm';

export interface ISPListViewCommandBarProps {
    formFields: IFormField[];
    canAddItem: boolean;
    items?: IEditableListItem[];
    listForm: SPListForm;
    listView: SPListView;
    onItemDeleting?: () => void;
    onItemDeleted?: () => void;
}

export interface ISPListViewCommandBarState {
    refreshCommandEnabled: boolean;
    addCommandEnabled: boolean;
    editCommandEnabled: boolean;
    viewCommandEnabled: boolean;
    deleteCommandEnabled: boolean;
    isDeleting?: boolean;
}

export class SPListViewCommandBar extends React.Component<ISPListViewCommandBarProps, ISPListViewCommandBarState> {

    constructor(props: ISPListViewCommandBarProps) {
        super(props);

        // Initialize state
        this.state = {
            refreshCommandEnabled: true,
            addCommandEnabled: this.props.canAddItem,
            viewCommandEnabled: true,
            editCommandEnabled: true,
            deleteCommandEnabled: true
        };
    }

    public async componentDidMount() {

    }

    public async componentDidUpdate(prevProps: ISPListViewCommandBarProps, prevState: ISPListViewCommandBarState) {
        if (!isEqual(prevProps.canAddItem, this.props.canAddItem)) {
            this.setState({ addCommandEnabled: this.props.canAddItem });
        }
        if (!isEqual(prevProps.items, this.props.items)) {
            this.setState({
                addCommandEnabled: this.props.canAddItem,
                viewCommandEnabled: true,
                editCommandEnabled: true,
                deleteCommandEnabled: true, refreshCommandEnabled: true,
            });
        }
    }

    public componentWillUnmount() {

    }

    public render(): React.ReactElement {
        return <>
            <CommandBar items={this.getCommandItems()} farItems={this.getFarCommandItems()} />
            {this.renderDeleteDialog()}
        </>;
    }


    protected getCommandItems(): ICommandBarItemProps[] {
        const { listView, items, formFields, canAddItem, listForm } = this.props;
        const { addCommandEnabled, viewCommandEnabled, editCommandEnabled, deleteCommandEnabled } = this.state;
        const canEdit = items instanceof Array && items.length === 1 && items[0].CanEdit && this.props.formFields instanceof Array && this.props.formFields.length > 0;
        const canDelete = items instanceof Array && items.length > 0 && items.filter(item => item.CanDelete === true).length === items.length;
        const canView = items instanceof Array && items.length === 1 && this.props.formFields instanceof Array && this.props.formFields.length > 0;

        return [
            {
                key: 'add', text: 'Add', iconProps: { iconName: 'Add' }, iconOnly: true,
                disabled: !addCommandEnabled || !listView || !(canAddItem && formFields instanceof Array && formFields.length > 0)
                    || (items instanceof Array && items.length > 0),
                onClick: () => {
                    if (listForm) {
                        this.setState({ addCommandEnabled: false, editCommandEnabled: false, viewCommandEnabled: false, deleteCommandEnabled: false });
                        listForm.open(FormMode.New, undefined, () => {
                            this.setState({ addCommandEnabled: canAddItem, editCommandEnabled: true, viewCommandEnabled: true, deleteCommandEnabled: true });
                        });
                    }
                }
            },
            {
                key: 'edit', text: 'Edit', iconProps: { iconName: 'Edit' }, iconOnly: true,
                disabled: !editCommandEnabled || !canEdit,
                onClick: () => {
                    if (canEdit) {
                        if (listForm) {
                            this.setState({ addCommandEnabled: false, editCommandEnabled: false, viewCommandEnabled: false, deleteCommandEnabled: false });
                            listForm.open(FormMode.Edit, items[0].ID, () => {
                                this.setState({ addCommandEnabled: canAddItem, editCommandEnabled: true, viewCommandEnabled: true, deleteCommandEnabled: true });
                            });
                        }
                    }
                }
            },
            {
                key: 'view', text: 'View', iconProps: { iconName: 'View' }, iconOnly: true,
                disabled: !viewCommandEnabled || !canView,
                onClick: () => {
                    if (canView) {
                        if (listForm) {
                            this.setState({ addCommandEnabled: false, editCommandEnabled: false, viewCommandEnabled: false, deleteCommandEnabled: false });
                            listForm.open(FormMode.Display, items[0].ID, () => {
                                this.setState({ addCommandEnabled: canAddItem, editCommandEnabled: true, viewCommandEnabled: true, deleteCommandEnabled: true });
                            });
                        }
                    }
                }
            },
            {
                key: 'delete', text: 'Delete', iconProps: { iconName: 'Delete' }, iconOnly: true,
                disabled: !deleteCommandEnabled || !canDelete,
                onClick: () => {
                    if (canDelete) {
                        this.setState({ isDeleting: true, addCommandEnabled: false, editCommandEnabled: false, viewCommandEnabled: false, deleteCommandEnabled: false });
                    }
                }
            }
        ];
    }

    protected getFarCommandItems(): ICommandBarItemProps[] {
        const { listView, canAddItem } = this.props;
        const { refreshCommandEnabled } = this.state;
        return [
            {
                key: 'refresh', text: 'Refresh', iconProps: { iconName: 'Refresh' }, iconOnly: true,
                disabled: !listView || !refreshCommandEnabled,
                onClick: () => {
                    if (listView) {
                        this.setState({ refreshCommandEnabled: false, deleteCommandEnabled: false, addCommandEnabled: false, editCommandEnabled: false, viewCommandEnabled: false });
                        listView.refresh().then(() => {
                            this.setState({ refreshCommandEnabled: true, addCommandEnabled: canAddItem, editCommandEnabled: true, viewCommandEnabled: true, deleteCommandEnabled: true });
                        });
                    }
                }
            }
        ];
    }

    private renderDeleteDialog() {
        const { listView, items, canAddItem, onItemDeleted, onItemDeleting } = this.props;
        const { isDeleting } = this.state;
        return listView && <Dialog
            hidden={isDeleting !== true}
            onDismiss={() => {
                this.setState({ isDeleting: false, addCommandEnabled: canAddItem, editCommandEnabled: true, viewCommandEnabled: true, deleteCommandEnabled: true });
            }}
            dialogContentProps={{
                type: DialogType.normal,
                title: 'Delete?',
                closeButtonAriaLabel: 'Close',
                subText: 'Are you sure you want to delete the item(s)?',
            }}
            modalProps={{
                isBlocking: false,
                styles: { main: { maxWidth: 450 } },
            }}>
            <DialogFooter>
                <PrimaryButton onClick={() => {
                    this.setState({ isDeleting: false, deleteCommandEnabled: true, addCommandEnabled: canAddItem, editCommandEnabled: true, viewCommandEnabled: true, },
                        () => {
                            if (onItemDeleting instanceof Function) {
                                onItemDeleting();
                            }
                        });
                    cancelable(listView.deleteItem(...items).then(_ => {
                        if (listView) {
                            //listView.refresh();
                        }
                        if (onItemDeleted instanceof Function) {
                            onItemDeleted();
                        }
                    }).catch(_ => {

                    }))
                        .finally(() => {

                        });
                }} text="Delete" />
                <DefaultButton onClick={() => {
                    this.setState({ isDeleting: false, addCommandEnabled: canAddItem, editCommandEnabled: true, viewCommandEnabled: true, deleteCommandEnabled: true });
                }} text="Cancel" />
            </DialogFooter>
        </Dialog>;
    }

}