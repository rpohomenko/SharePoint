import React from "react";
import PropTypes from 'prop-types';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { isNumber } from "util";

export class ListFormPanel extends React.Component {

    constructor(props) {
        super(props);
        this._service = props.service;
        this.state = {
            ...props
        };
        this._listForm = React.createRef();
    }

    componentWillMount() {

    }

    componentDidUpdate(nextProps, nextState) {
        if (nextProps.item !== undefined && nextState.item !== nextProps.item) {
            this.setState({ item: nextProps.item });
        }
        if (nextProps.itemId !== undefined && nextState.itemId !== nextProps.itemId) {
            this.setState({ itemId: nextProps.itemId });
        }
    }

    componentWillUnmount() {
    }

    render() {
        const { onRenderListForm, onItemSaving, onItemSaved, onItemDeleting, onItemDeleted, onItemLoaded } = this.props;
        const { mode, item, itemId, confirmClosePanel, showPanel, isDirty } = this.state;
        let listForm;
        let renderListForm = this._renderListForm;

        if (typeof onRenderListForm === "function") {
            renderListForm = onRenderListForm;
        }
        if (showPanel) {
            listForm = renderListForm(
                mode,
                this._listForm,
                item,
                itemId,
                (items, renderCommandItem) => this._renderCommandBar(items, renderCommandItem),
                (sender, isValid, isDirty) => this._validate(isValid, isDirty),
            /*(sender, mode) => this.changeMode(mode)*/ null,
                this._closeForm,
                (sender, item) => {
                    this.setState({ isSaving: true }, () => {
                        if (typeof onItemSaving === "function") {
                            onItemSaving(sender, item);
                        }
                    });
                },
                (sender, item) => {
                    this.setState({ item: item, confirmClosePanel: false },
                        () => {
                            this.setState({ isSaving: false, isDirty: false }, () => {
                                if (typeof onItemSaved === "function") {
                                    onItemSaved(sender, item);
                                }
                            });
                        });
                },
                (sender, item) => {
                    this.setState({ isDeleting: true }, () => {
                        if (typeof onItemDeleting === "function") {
                            onItemDeleting(sender, item);
                        }
                    });
                },
                (sender, item) => {
                    this.setState({ isDeleting: false, isValid: true, isDirty: false, item: undefined, itemId: undefined }, () => {
                        if (typeof (onItemDeleted) === "function") {
                            onItemDeleted(sender, item);
                        }
                    });
                },
                (sender, item) => {
                    this.setState({ item: item, isDirty: false, isLoaded: true }, () => {
                        if (typeof (onItemLoaded) === "function") {
                            onItemLoaded(sender, item);
                        }
                    });
                });

            return (
                <div className="listform-panel-container" ref={this._container}>
                    <Panel
                        ref={ref => this._panel = ref}
                        isOpen={showPanel}
                        isLightDismiss={true}
                        onRenderHeader={(props, defaultRender, headerTextId) => this._renderPanelHeader(props, defaultRender, headerTextId)}
                        onDismiss={() => {
                            if (isDirty && mode > 0) {
                                this.setState({ confirmClosePanel: true });
                            }
                            else {
                                this.close();
                            }
                        }}
                        closeButtonAriaLabel="Close"
                        type={PanelType.medium}
                        onRenderFooterContent={this._onRenderFooterContent}
                        isFooterAtBottom={true}>
                        {listForm}
                    </Panel>
                {confirmClosePanel && mode > 0 && isDirty &&
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
                </div>
            );
        }
        return null;
    }

    _renderListForm = (mode, ref, item, itemId, onRenderCommandBar, onValidate, onChangeMode, onCloseForm, onItemSaving, onItemSaved, onItemDeleting, onItemDeleted, onItemLoaded) => {
        throw "Method _renderListForm is not yet implemented!";
    }
    _renderCommandBar(items, renderCommandItem) {
        return null;
        /*let { commandBar } = this.state;
        if (!commandBar) {
            commandBar = (<CommandBar className="sticky-top" ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                items={items}
                onRenderItem={renderCommandItem} />);
            //TODO: Warning: Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.
            //this.setState({ commandBar: commandBar });
        }
        return commandBar;*/
    }

    _renderPanelHeader = (
        props,
        defaultRender,
        headerTextId
    ) => {
        const { newItemHeader, editItemHeader, viewItemHeader } = this.props;
        const { mode } = this.state;
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
            <CommandBar ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                items={this._getCommandItems()}
                farItems={this._getCommandFarItems()}
                onRenderItem={this._onRenderCommandItem} />
        </div>);
    };

    _onSaveClick = async () => {
        const { isValid, isDirty } = this.state;
        if (this._listForm.current && isValid && isDirty) {
            this.setState({ isDirty: false });
            let result = await this._listForm.current.saveItem();
            if (!result.ok) {
                this.setState({ isDirty: true });
            }
        }
    }

    _refresh = async () => {
        const { itemId, item } = this.state;
        if (this._listForm.current) {
            this.setState({ isDirty: false, isRefreshing: true });
            return await this._listForm.current.loadItem(item ? item.Id : itemId).then((result) => {
                this.setState({ isRefreshing: false });
            });
        }
    }

    _onRenderFooterContent = () => {
        const { canAddListItems } = this.props;
        const { isValid, isDirty, mode, item, isDeleting, isSaving, isRefreshing } = this.state;
        let canSave = false;
        if (mode === 2) {
            canSave = canAddListItems;
        }
        else if (mode === 1) {
            if (item) {
                canSave = item.CanUpdate;
            }
        }

        let isBusy = isDeleting || isSaving || isRefreshing;
        /*if (this._listForm.current) {
            isBusy = this._listForm.current.state.isSaving || this._listForm.current.state.isDeleting;
        }*/
        return (
            <div>
                {mode > 0 && <PrimaryButton onClick={() => this._onSaveClick()} disabled={!canSave || isBusy || !isDirty || !isValid} style={{ marginRight: 7 }}>Save</PrimaryButton>}
                <DefaultButton onClick={() => this.close()}>{mode > 0 ? "Cancel" : "Close"}</DefaultButton>
            </div>);

    }

    _getCommandItems() {
        const { canAddListItems } = this.props;
        const { item, mode, isValid, isDirty, isSaving, isDeleting, isRefreshing, isLoaded } = this.state;
        /*if (this._listForm.current) {
            isSaving = this._listForm.current.state.isSaving;
            isDeleting = this._listForm.current.state.isDeleting;
        }*/

        let canSave = false, canEdit, canDelete = false;
        if (mode === 2) {
            canSave = canAddListItems;
        }
        else if (mode === 1) {
            if (item) {
                canSave = item.CanUpdate;
            }
        }
        if (item) {
            canEdit = item.CanUpdate;
            canDelete = item.CanDelete;
        }

        let items = [];

        if (item && mode === 0) {
            items.push(
                {
                    key: 'editItem',
                    icon: 'Edit',
                    text: '',
                    disabled: !canEdit || !!(isDeleting || isSaving || isRefreshing) /*|| !isLoaded*/,
                    onClick: (e, sender) => this.changeMode(1),
                    iconProps: {
                        iconName: 'Edit'
                    },
                    ariaLabel: 'Edit'
                });
        }
        else if (mode === 2 || (item && mode === 1)) {
            items.push(
                {
                    key: 'saveItem',
                    icon: 'Save',
                    text: '',
                    disabled: !canSave || !!(isDeleting || isSaving || isRefreshing) || !(isValid && isDirty) /*|| !isLoaded*/,
                    onClick: (e, sender) => {
                        this._onSaveClick();
                    },
                    iconProps: {
                        iconName: 'Save'
                    },
                    ariaLabel: 'Save'
                });
        }
        if (item && mode < 2) {
            items.push(
                {
                    key: 'deleteItem',
                    icon: 'Delete',
                    text: '',
                    disabled: !canDelete || !!(isDeleting || isSaving || isRefreshing) /*|| !isLoaded*/,
                    onClick: (e, sender) => {
                        if (this._listForm.current) {
                            this._listForm.current.setState({ confirmDeletion: true });
                        }
                    },
                    iconProps: {
                        iconName: 'Delete'
                    },
                    ariaLabel: 'Delete'
                });
        }
        return items;
    }

    _getCommandFarItems() {
        const { item, mode, isRefreshing, isDeleting, isSaving, isLoaded } = this.state;
        //let isLoading = false;
         //if (this._listForm.current) {
            //isSaving = this._listForm.current.state.isSaving;
            //isDeleting = this._listForm.current.state.isDeleting;
            //isLoading = this._listForm.current.state.isLoading;
        //}
        if (item && (mode === 0 || mode === 1)) {
            return [{
                key: 'refresh',
                icon: 'Refresh',
                text: '',
                disabled: isDeleting || isSaving || /*isLoading*/ /*!isLoaded ||*/ isRefreshing,
                onClick: (e, sender) => this._refresh(),
                iconProps: {
                    iconName: 'Refresh'
                },
                ariaLabel: 'Refresh'
            }];
        }
    }

    _onRenderCommandItem = (item) => {
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

    changeMode(mode) {
        this.setState({ mode: mode, commandBar: undefined }, () => {
            if (this._listForm.current) {
                this._listForm.current.changeMode(mode);
            }
        });
    }

    open(mode) {
        const { showPanel } = this.state;
        if (!showPanel) {
            this.setState({ showPanel: true });
        }
        if (isNumber(mode)) {
            this.changeMode(mode);
        }
    };

    close() {
        const { showPanel } = this.state;
        if (showPanel) {
            this.setState({ showPanel: false, isDirty: false, isValid: false, commandBar: undefined });
        }
    };

    _validate = (isValid, isDirty) => {
        this.setState({ isValid: isValid, isDirty: isDirty, commandBar: undefined });
    }

    _closeForm = (result, callback) => {
        this.close();
        if (typeof callback === "function") {
            callback(this, result);
        }
    }
}

ListFormPanel.propTypes = {
}

ListFormPanel.defaultProps = {
}

export default ListFormPanel;