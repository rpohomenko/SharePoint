import React from "react";
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import ListFormPanel from "../form/ListFormPanel";
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';

export class BaseListViewCommand extends React.Component {

    constructor(props) {
        super(props);
        this._onNewItem = this._onNewItem.bind(this);
        this._onEditItem = this._onEditItem.bind(this);
        this._onViewItem = this._onViewItem.bind(this);
        this._onDelete = this._onDelete.bind(this);
        this._getItems = this._getItems.bind(this);

        this.state = {
            ...this.state
        };

        this._container = React.createRef();
    }

    render() {
        const { itemsToDelete, status, showForm, mode } = this.state;
        return (
            <div className="command-container" ref={this._container}>
                <CommandBar ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                    items={this._getItems()}
                    farItems={[{
                        key: 'refresh',
                        icon: 'Refresh',
                        text: '',
                        onClick: (e, sender) => this.refresh(),
                        iconProps: {
                            iconName: 'Refresh'
                        },
                        ariaLabel: 'Refresh'
                    }]}
                    onRenderOverflowButton={this._onRenderOverflowButton}
                    onRenderItem={this._onRenderItem} />
                <Dialog
                    hidden={!itemsToDelete || itemsToDelete.length === 0}
                    onDismiss={this._closeDialog}
                    dialogContentProps={{
                        type: DialogType.normal,
                        title: 'Delete?',
                        subText: 'Are you sure you want to delete the item(s)?'
                    }}
                    modalProps={{
                        isBlocking: true,
                        styles: { main: { maxWidth: 450 } }
                    }}>
                    <DialogFooter>
                        <PrimaryButton onClick={() => {
                            const { itemsToDelete } = this.state;
                            this._onDelete(itemsToDelete);
                            this._closeDialog();
                        }} text="Yes" />
                        <DefaultButton onClick={this._closeDialog} text="No" />
                    </DialogFooter>
                </Dialog>
                {<ListFormPanel ref={ref => this._panel = ref} showPanel={showForm} mode={mode} listFormGetter={(mode) => this._getForm(mode)} />}
                {
                    status &&
                    (<MessageBar messageBarType={status.type} isMultiline={false} onDismiss={() => {
                        this.setState({ status: undefined });
                    }} dismissButtonAriaLabel="Close">
                        {status.content}
                    </MessageBar>)
                }
            </div>
        );
    }

    _closeDialog = () => {
        this.setState({ itemsToDelete: null });
    };

    _onRenderItem = (item) => {
        return (
            <CommandBarButton
                role="menuitem"
                aria-label={item.name}
                styles={{ root: { padding: '10px' } }}
                iconProps={{ iconName: item.icon }}
                onClick={item.onClick}
            />
        );
    };

    _onRenderOverflowButton = (overflowItems) => {
        return (
            <CommandBarButton
                role="menuitem"
                title="More"
                styles={{ root: { padding: 10 } }}
                menuIconProps={{ iconName: 'More' }}
                menuProps={{ items: overflowItems }}
            />
        );
    };

    _getItems() {
        const { selection, itemsToDelete } = this.state;
        let items = [];
        items.push(
            {
                key: 'newItem',
                icon: 'Add',
                text: '',
                onClick: (e, sender) => this._onNewItem(),
                iconProps: {
                    iconName: 'Add'
                },
                ariaLabel: 'New'
            });
        if (selection && (!itemsToDelete || itemsToDelete.length === 0)) {
            if (selection.length === 1) {
                items.push(
                    {
                        key: 'viewItem',
                        icon: 'View',
                        text: '',
                        onClick: (e, sender) => this._onViewItem(selection[0]),
                        iconProps: {
                            iconName: 'View'
                        },
                        ariaLabel: 'View'
                    });
                items.push(
                    {
                        key: 'editItem',
                        icon: 'Edit',
                        text: '',
                        onClick: (e, sender) => this._onEditItem(selection[0]),
                        iconProps: {
                            iconName: 'Edit'
                        },
                        ariaLabel: 'Edit'
                    });
            }
            if (selection.length > 0) {
                items.push(
                    {
                        key: 'deleteItem',
                        icon: 'Delete',
                        text: '',
                        onClick: (e, sender) => this.deleteItem(selection),
                        iconProps: {
                            iconName: 'Delete'
                        },
                        ariaLabel: 'Delete'
                    });
            }
        }
        return items;
    }

    _onNewItem = () => {
        this._changeMode(2);
    }

    _onEditItem = (item) => {
        this._changeMode(1);
    }

    _onViewItem = (item) => {
        this._changeMode(0);
    }

    _changeMode = (mode) => {
        this.setState({ showForm: true, mode: mode, status: undefined });
        let panel = this._panel;
        if (panel) {
            panel.setState({ showPanel: true, mode: mode });
        }
    }

    _validate = (isValid, isDirty) => {
        let panel = this._panel;
        if (panel) {
            panel.setState({ isValid: isValid, isDirty: isDirty });
        }
    }

    _closeForm = (result, message) => {
        let panel = this._panel;
        if (panel) {
            panel._hidePanel(result);
        }
        if (result === 1) {
            this.refresh();
            this.setState({ status: { content: message, type: MessageBarType.success } });
        }

    }

    _onDelete = (items) => {
        throw "Method _onDelete is not yet implemented!";
    }

    viewItem(item) {
        this._onViewItem(item);
    }

    editItem(item) {
        this._onEditItem(item);
    }

    deleteItem(items) {
        this.setState({ itemsToDelete: items });
    }

    async refresh() {
        const { onRefresh } = this.props;
        if (typeof onRefresh === "function") {
            await onRefresh();
        }
    }
}

export default BaseListViewCommand;