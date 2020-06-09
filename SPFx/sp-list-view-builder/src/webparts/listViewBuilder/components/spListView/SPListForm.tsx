import * as React from 'react';
import { isEqual } from '@microsoft/sp-lodash-subset';
import { IList } from "@pnp/sp/lists";
import { ITimeZoneInfo, IRegionalSettingsInfo } from "@pnp/sp/regional-settings/types";
import { FormMode, IFormField } from '../../../../utilities/Entities';
import { cancelable, CancelablePromise } from 'cancelable-promise';
import { ListForm } from '../../../../controls/form/ListForm';
import { SPListView } from '../spListView';
import SPService from '../../../../utilities/SPService';
import { PermissionKind } from '@pnp/sp/security';
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton, ProgressIndicator, Panel, CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react' /* '@fluentui/react'*/;

interface CancelablePromise {
    cancel: () => void;
}

export interface ISPListFormProps {
    list: IList;
    itemId?: number;
    fields: IFormField[];
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
    headerText: string;
    isOpen?: boolean;
    listView: SPListView;
}

export interface ISPListFormState {
    mode?: FormMode;
    itemId?: number;
    refreshCommandEnabled?: boolean;
    saveCommandEnabled?: boolean;
    isOpen?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    isDeleteOpen?: boolean;
    isDeleting?: boolean;
    //onClose?: () => void;
}

export class SPListForm extends React.Component<ISPListFormProps, ISPListFormState> {
    private _listForm: React.RefObject<ListForm>;
    private _savePromise: CancelablePromise;
    private _loadPromise: CancelablePromise;
    private _onClose?: () => void;

    constructor(props: ISPListFormProps) {
        super(props);

        // Initialize state
        this.state = {
            isOpen: this.props.isOpen,
            itemId: this.props.itemId,
            saveCommandEnabled: false,
            refreshCommandEnabled: this.props.itemId > 1
        };

        this._listForm = React.createRef();
    }

    public async componentDidMount() {

    }

    public async componentDidUpdate(prevProps: ISPListFormProps, prevState: ISPListFormState) {
        if (!isEqual(prevProps.isOpen, this.props.isOpen)) {
            this.setState({ isOpen: this.props.isOpen });
        }
        if (!isEqual(prevProps.itemId, this.props.itemId)) {
            this.setState({ itemId: this.props.itemId });
        }
    }

    public componentWillUnmount() {
        if (this._loadPromise) {
            this._loadPromise.cancel();
            this._loadPromise = null;
        }
    }

    public render(): React.ReactElement {
        const { list, fields, headerText, regionalSettings, timeZone } = this.props;
        const { mode, itemId, refreshCommandEnabled, saveCommandEnabled, isOpen, isDeleting } = this.state;
        return isOpen === true && <Panel isLightDismiss isOpen={isOpen === true}
            onLightDismissClick={() => {
                if (this._listForm.current && this._listForm.current.isDirty) {
                    return;
                }
                this.close();
            }} onDismiss={() => {
                this.close();
            }} closeButtonAriaLabel={"Close"}
            headerText={`${headerText ? headerText + ": " : ""}${mode === FormMode.Edit ? "Edit" : (mode === FormMode.New ? "New" : "View")}`}
            onRenderFooterContent={this.renderFooterContent.bind(this)}
            isFooterAtBottom={false}>
            <CommandBar items={this.getCommandItems()}
                farItems={this.getFarCommandItems()} />
            {isDeleting && <ProgressIndicator label="Deleting..." />}
            {!isDeleting && <ListForm ref={this._listForm} itemId={mode === FormMode.New ? 0 : itemId} list={list}
                regionalSettings={regionalSettings}
                timeZone={timeZone}
                fields={fields} mode={mode}
                onItemLoaded={(item) => {
                    const canEdit = SPService.doesItemHavePermissions(item, PermissionKind.EditListItems);
                    const canDelete = SPService.doesItemHavePermissions(item, PermissionKind.DeleteListItems);
                    this.setState({ itemId: item ? item.ID : 0, canEdit: canEdit, canDelete: canDelete, refreshCommandEnabled: item && item.ID > 0, saveCommandEnabled: (mode === FormMode.Edit || mode === FormMode.New) && this._listForm.current.isDirty === true });
                }}
                onChange={this.onFieldValueChange.bind(this)} />}
            {this.renderDeleteDialog()}
        </Panel>;
    }

    protected onFieldValueChange(field: IFormField, value: any, isDirty: boolean) {
        if (this._listForm.current) {
            const { refreshCommandEnabled, saveCommandEnabled } = this.state;
            const isValid = this._listForm.current.isValid;
            isDirty = (isDirty || this._listForm.current.isDirty) && !this._listForm.current.state.isLoading;
            if (refreshCommandEnabled !== (!this._listForm.current.state.isLoading) || saveCommandEnabled !== (isDirty === true && isValid === true)) {
                this.setState({ refreshCommandEnabled: !this._listForm.current.state.isLoading, saveCommandEnabled: isDirty === true && isValid === true });
            }
        }
    }

    private renderFooterContent = () => {
        const { saveCommandEnabled } = this.state;
        return (<div>
            <PrimaryButton disabled={!saveCommandEnabled} onClick={() => {
                this.save();
            }} styles={{ root: { marginRight: 8 } }}>
                {"Save"}
            </PrimaryButton>
            <DefaultButton onClick={() => this.close()}>{"Cancel"}</DefaultButton>
        </div>);
    }

    protected getFarCommandItems(): ICommandBarItemProps[] {
        const { mode, refreshCommandEnabled } = this.state;
        const items: ICommandBarItemProps[] = [];
        if (mode !== FormMode.New) {
            items.push({
                key: 'refresh', text: 'Refresh', iconProps: { iconName: 'Refresh' }, iconOnly: true,
                disabled: !refreshCommandEnabled,
                onClick: () => {
                    if (this._listForm.current) {
                        if (this._loadPromise) {
                            this._loadPromise.cancel();
                        }
                        this.setState({ refreshCommandEnabled: false, saveCommandEnabled: false });
                        this._loadPromise = cancelable(this._listForm.current.loadItem())
                            .finally(() => {
                                this._loadPromise = null;
                                this.setState({ refreshCommandEnabled: true });
                            });
                    }
                }
            });
        }
        return items;
    }

    protected getCommandItems(): ICommandBarItemProps[] {
        const { mode, itemId, saveCommandEnabled, canEdit, canDelete, isDeleting } = this.state;
        const items: ICommandBarItemProps[] = [];
        if (mode === FormMode.Edit || mode === FormMode.New) {
            items.push({
                key: 'save', text: 'Save', iconProps: { iconName: 'Save' }, iconOnly: true,
                disabled: (mode !== FormMode.New && mode !== FormMode.Edit) || !saveCommandEnabled || isDeleting === true,
                onClick: () => {
                    this.save();
                }
            });
        }
        if (mode === FormMode.Display) {
            items.push({
                key: 'edit', text: 'Edit', iconProps: { iconName: 'Edit' }, iconOnly: true,
                disabled: !canEdit || itemId === 0 || isDeleting === true,
                onClick: () => {
                    if (this._listForm.current) {
                        this.setState({ mode: FormMode.Edit });
                    }
                }
            });
            items.push({
                key: 'delete', text: 'Delete', iconProps: { iconName: 'Delete' }, iconOnly: true,
                disabled: !canDelete || itemId === 0 || isDeleting === true,
                onClick: () => {
                    this.setState({ isDeleteOpen: true });
                }
            });
        }
        return items;
    }

    private save() {
        if (this._listForm.current) {
            const { listView, list } = this.props;
            if (!this._listForm.current.state.isSaving) {
                if (this._savePromise) {
                    this._savePromise.cancel();
                }
                this.setState({ saveCommandEnabled: false, refreshCommandEnabled: false });
                this._savePromise = cancelable(this._listForm.current.save()
                    .then((item) => {
                        if (item) {
                            //this.setState({ isOpen: false });
                            this.close();
                            if (listView) {
                                listView.refresh();
                            }
                        }
                        else {
                            //this.setState({ saveCommandEnabled: true });
                        }
                    })
                    .catch(() => {
                        this.setState({ saveCommandEnabled: true });
                    }))
                    .finally(() => {
                        this._savePromise = null;
                        this.setState({ refreshCommandEnabled: true });
                    });
            }
        }
    }

    private renderDeleteDialog() {
        const { listView } = this.props;
        const { itemId, isDeleteOpen } = this.state;
        return <Dialog
            hidden={isDeleteOpen !== true}
            onDismiss={() => {
                this.setState({ isDeleteOpen: false });
            }}
            dialogContentProps={{
                type: DialogType.normal,
                title: 'Delete?',
                closeButtonAriaLabel: 'Close',
                subText: 'Are you sure you want to delete the item?',
            }}
            modalProps={{
                isBlocking: false,
                styles: { main: { maxWidth: 450 } },
            }}>
            <DialogFooter>
                <PrimaryButton onClick={() => {
                    if (this._listForm.current) {
                        this.setState({ isDeleting: true, isDeleteOpen: false, refreshCommandEnabled: false, saveCommandEnabled: false });
                        cancelable(this._listForm.current.deleteItem(itemId).then(_ => {
                            if (listView) {
                                listView.refresh();
                            }
                            this.setState({ isOpen: false });
                        })).finally(() => {
                            this.setState({ isDeleting: false });
                        });
                    }
                }} text="Delete" />
                <DefaultButton onClick={() => {
                    this.setState({ isDeleteOpen: false });
                }} text="Cancel" />
            </DialogFooter>
        </Dialog>;
    }

    public open(mode: FormMode, itemId?: number, onClose?: () => void) {
        this.setState({ isOpen: true, mode: mode });
        if (mode === FormMode.New) {
            this.setState({ itemId: 0, refreshCommandEnabled: false });
        }
        else if (itemId > 0) {
            this.setState({ itemId: itemId, refreshCommandEnabled: /*itemId > 0*/ false });
        }
        if (onClose instanceof Function) {
            this._onClose = onClose;
            //this.setState({ onClose: onClose });
        }
    }

    public close() {
        //const { onClose } = this.state;
        const onClose = this._onClose;
        this.setState({ isOpen: false }, () => {
            if (onClose instanceof Function) {
                onClose();
            }
        });
    }

}