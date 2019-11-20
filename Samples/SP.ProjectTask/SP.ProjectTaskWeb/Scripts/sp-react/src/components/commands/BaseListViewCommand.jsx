import React from "react";
import PropTypes from 'prop-types';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { StatusBar } from '../StatusBar';
import { isArray } from "util";

export class BaseListViewCommand extends React.Component {

    constructor(props) {
        super(props);
        this._onNewItem = this._onNewItem.bind(this);
        this._onEditItem = this._onEditItem.bind(this);
        this._onViewItem = this._onViewItem.bind(this);
        this._onDelete = this._onDelete.bind(this);
        this._getItems = this._getItems.bind(this);

        this.state = {
            ...this.props,
            refreshEnabed: false,
            newItemEnabled: false,
            isDeleting: false,
            confirmDeletion: false
        };

        this._container = React.createRef();
        this._listForm = React.createRef();
    }

    componentWillUnmount() {       
    }

    render() {
        const { mode, selection, refreshEnabed, confirmDeletion, confirmClosePanel, isDeleting, showPanel, isDirty, onItemSaving, onItemSaved, onItemDeleting, onItemDeleted } = this.state;
        //let item = selection && selection.length > 0 ? selection[0] : undefined;
        let listForm = this._getForm(mode, this._listForm,
            (items, renderCommandItem) => this._renderCommandBar(items, renderCommandItem),
            (sender, isValid, isDirty) => this._validate(isValid, isDirty),
            (sender, mode) => this._changeMode(mode),
            this._closeForm,
            (sender, item) => {
                this.setState({ isDirty: false, commandBar: undefined }, () => {
                    if (typeof onItemSaving === "function") {
                        onItemSaving(sender, item);
                    }
                });
            },
            (sender, item) =>{                
                this.setState({confirmDeletion: false, confirmClosePanel: false},
                    () => {
                        if (typeof onItemSaved === "function") {
                            onItemSaved(sender, item);
                        }
                    });
            },
            (sender, item) => {
                this.setState({ isDirty: false, commandBar: undefined }, () => {
                    if (typeof onItemDeleting === "function") {
                        onItemDeleting(sender, item);
                    }
                });
            },
            onItemDeleted);
        return (
            <div className="command-container" ref={this._container}>
                <CommandBar ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                    items={this._getItems()}
                    farItems={[{
                        key: 'refresh',
                        icon: 'Refresh',
                        text: '',
                        disabled: !refreshEnabed || isDeleting,
                        onClick: (e, sender) => this.refresh(),
                        iconProps: {
                            iconName: 'Refresh'
                        },
                        ariaLabel: 'Refresh'
                    }]}
                    onRenderOverflowButton={this._onRenderOverflowButton}
                    onRenderItem={this._onRenderItem} />
                <Dialog
                    hidden={!confirmDeletion}
                    onDismiss={() => this.setState({ confirmDeletion: false })}
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
                            const { selection } = this.state;
                            this._onDelete(selection);
                            this.setState({ confirmDeletion: false });
                        }} text="Yes" />
                        <DefaultButton onClick={() => this.setState({ confirmDeletion: false })} text="No" />
                    </DialogFooter>
                </Dialog>
                {showPanel && (<Panel
                    ref={ref => this._panel = ref}
                    isOpen={showPanel}
                    isLightDismiss={true}
                    onRenderHeader={this._renderPanelHeader}
                    onDismiss={() => {
                        if (isDirty && mode > 0) {
                            this.setState({ confirmClosePanel: true });
                        }
                        else {
                            this._hidePanel();
                        }
                    }}
                    closeButtonAriaLabel="Close"
                    type={PanelType.medium}
                    onRenderFooterContent={this._onRenderFooterContent}
                    isFooterAtBottom={true}>
                    {listForm}
                </Panel>)}
                {mode > 0 && isDirty &&
                    (<Dialog
                        hidden={confirmClosePanel !== true}
                        onDismiss={() => this.setState({ confirmClosePanel: false })}
                        dialogContentProps={{
                            type: DialogType.normal,
                            title: 'Close?',
                            subText: 'Are you sure you want to close the form without saving?'
                        }}
                        modalProps={{
                            isBlocking: true,
                            styles: { main: { maxWidth: 450 } }
                        }}>
                        <DialogFooter>
                            <PrimaryButton onClick={() => this.setState({ confirmClosePanel: false, showPanel: false, isDirty: false, isValid: false })} text="Yes" />
                            <DefaultButton onClick={() => this.setState({ confirmClosePanel: false })} text="No" />
                        </DialogFooter>
                    </Dialog>)}
                <StatusBar ref={ref => this._status = ref} />
            </div>
        );
    }

    _renderCommandBar(items, renderCommandItem) {
        let { commandBar } = this.state;
        if (!commandBar) {
            commandBar = (<CommandBar className="sticky-top" ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                items={items}
                onRenderItem={renderCommandItem} />);
                //TODO: Warning: Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.
                //this.setState({ commandBar: commandBar });
        }
        return commandBar;//null;
    }

    viewItem(item) {
        this._onViewItem(item);
    }

    editItem(item) {
        this._onEditItem(item);
    }

    deleteItem(items) {
        this.setState({ confirmDeletion: true });
    }

    async refresh() {
        const { onRefresh } = this.props;
        if (typeof onRefresh === "function") {
            await onRefresh();
        }
    }

    _renderPanelHeader = (
        props,
        defaultRender,
        headerTextId
    ) => {
        const { newItemHeader, editItemHeader, viewItemHeader } = this.props;
        const { mode, commandBar } = this.state;
        props = Object.assign({}, props);
        let headerText;
        switch (mode) {
            case 0:
                headerText = viewItemHeader
                break;
            case 1:
                headerText = editItemHeader
                break;
            case 2:
                headerText = newItemHeader
                break;
        }
        props.headerText = headerText;

        return (<div>
            {defaultRender(props, defaultRender, headerTextId)}
            {commandBar}
        </div>);
    };

    _onSaveClick = async () => {
        const { isValid, isDirty } = this.state;
        if (this._listForm.current && isValid && isDirty) {
            this.setState({ isDirty: false });
            return await this._listForm.current.saveItem();
        }
    }

    _onRenderFooterContent = () => {
        const { isValid, isDirty, mode } = this.state;
        let isBusy = false;
        if (this._listForm.current) {
            isBusy = this._listForm.current.state.isSaving || this._listForm.current.state.isDeleting;
        }
        return (
            <div>
                {mode > 0 && <PrimaryButton onClick={() => this._onSaveClick()} disabled={isBusy || !isDirty || !isValid} style={{ marginRight: 7 }}>Save</PrimaryButton>}
                <DefaultButton onClick={() => this._hidePanel()}>{mode > 0 ? "Cancel" : "Close"}</DefaultButton>
            </div>);

    }

    _onRenderItem = (item) => {
        return (
            <CommandBarButton
                role="menuitem"
                aria-label={item.name}
                disabled={item.disabled}
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
        const { commandItems } = this.props;
        const { selection, isDeleting, newItemEnabled } = this.state;
        let items = []
        if (isArray(commandItems)) {
            items = items.concat(commandItems);
        }
        items.push(
            {
                key: 'newItem',
                icon: 'Add',
                text: '',
                disabled: isDeleting || !newItemEnabled,
                onClick: (e, sender) => this._onNewItem(),
                iconProps: {
                    iconName: 'Add'
                },
                ariaLabel: 'New'
            });

        items.push(
            {
                key: 'viewItem',
                icon: 'View',
                text: '',
                disabled: isDeleting || (!selection || selection.length !== 1),
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
                disabled: isDeleting || (!selection || selection.length !== 1),
                onClick: (e, sender) => this._onEditItem(selection[0]),
                iconProps: {
                    iconName: 'Edit'
                },
                ariaLabel: 'Edit'
            });

        items.push(
            {
                key: 'deleteItem',
                icon: 'Delete',
                text: '',
                disabled: isDeleting || (!selection || selection.length === 0),
                onClick: (e, sender) => this.deleteItem(selection),
                iconProps: {
                    iconName: 'Delete'
                },
                ariaLabel: 'Delete'
            });

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

    _onDelete = (items) => {
        throw "Method _onDelete is not yet implemented!";
    }

    _changeMode = (mode) => {
        this.setState({ showPanel: true, mode: mode, status: undefined, commandBar: undefined });
    }

    _showPanel = () => {
        this.setState({ showPanel: true });
    };

    _hidePanel = () => {
        const { showPanel } = this.state;
        if (showPanel) {
            this.setState({ showPanel: false, isDirty: false, isValid: false, commandBar: undefined });
        }
    };

    _validate = (isValid, isDirty) => {
        this.setState({ isValid: isValid, isDirty: isDirty, commandBar: undefined });
    }

    _closeForm = (result, message, callback) => {
        this._hidePanel();
        if (message) {
            if (this._status) {
                if (result.ok) {
                    this._status.success(message, this.props.STATUS_TIMEOUT);
                }
                else {
                    this._status.warn(message, this.props.STATUS_TIMEOUT);
                }
            }
        }
        if (typeof callback === "function") {
            callback(this, result);
        }
    }

    async _onPromise(promise, onSuccess) {
        if (promise) {
            return await promise.then(response => {
                if (response.ok) {
                    return response.json().then(onSuccess);
                }
                else {
                    return response.json().then((error) => {
                        if (!error || !error.message) {
                            error = { message: `${response.statusText} (${response.status})` };
                        }
                        throw error;
                    }).catch((error) => {
                        if (!error || !error.message) {
                            throw { message: error };
                        }
                        throw error;
                    });
                }
            }).catch((error) => {
                if (error.code !== 20 && error.name !== 'AbortError') { //aborted
                    if (this._status) {
                        this._status.error(error.message ? error.message : error);
                    }
                }
                return { ok: false, data: error }; //error
            });
        }
    }
}

BaseListViewCommand.propTypes = {
    STATUS_TIMEOUT: PropTypes.number,
}

BaseListViewCommand.defaultProps = {
    STATUS_TIMEOUT: 5000
}

export default BaseListViewCommand;