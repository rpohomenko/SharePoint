import React from "react";
import PropTypes from 'prop-types';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
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
   
    render() {
        const { onRenderListForm, item, itemId, onItemSaving, onItemSaved, onItemDeleting, onItemDeleted, onItemLoaded } = this.props;
        const { mode, confirmClosePanel, showPanel, isDirty } = this.state;
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
                                if (item && typeof onItemSaved === "function") {
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
                        if (item && typeof (onItemDeleted) === "function") {
                            onItemDeleted(sender, item);
                        }
                    });
                },
                (sender, item) => {
                    this.setState({ item: item, isDirty: false, isLoaded: true }, () => {
                        if (item && typeof (onItemLoaded) === "function") {
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
    }

    _renderPanelHeader = (
        props,
        defaultRender,
        headerTextId
    ) => {        
        const { newItemHeader, editItemHeader, viewItemHeader } = this.props;
        const { mode } = this.state;
        props = {...{}, ...props}; //Object.assign({}, props);
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
        if(headerText){
           headerText = headerText.trunc(50);          
           props.headerText = headerText;
        }      
        let farItems = this._getCommandItems().concat(this._getCommandFarItems());
        return (<>
            <CommandBar ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                items={[
                    {
                        key: 'header',
                        onRender: () => {
                            return <div style={{ whiteSpace: 'nowrap' }}>{defaultRender(props, defaultRender, headerTextId)}</div>;
                        }
                    }
                ]}
                farItems={farItems}
                onRenderItem={this._onRenderCommandItem} />
        </>);
    };

    _onSaveClick = async () => {
        const { isValid, isDirty } = this.state;
        if (this._listForm.current && isValid && isDirty) {
            this.setState({ isDirty: false });
            let result = await this._listForm.current.saveItem();
            if (!result.ok) {
                this.setState({ isDirty: true, isSaving: false });
            }
        }
    }

    _refresh = async () => {
        const { itemId } = this.props;
        if (this._listForm.current) {
            let item = this._listForm.current.state.item;
            this.setState({ isDirty: false, isRefreshing: true });
            return await this._listForm.current.loadItem(item ? item.Id : itemId).then((result) => {
                this.setState({ isRefreshing: false });
            });
        }
    }

    _onRenderFooterContent = () => {
        let { canAddListItems, item } = this.props;
        const { isValid, isDirty, mode, isDeleting, isSaving, isRefreshing } = this.state;
        if (this._listForm.current) {
            item = this._listForm.current.state.item;
        }
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
        let { canAddListItems, item } = this.props;
        const { mode, isValid, isDirty, isSaving, isDeleting, isRefreshing, isLoaded } = this.state;
        /*if (this._listForm.current) {
            isSaving = this._listForm.current.state.isSaving;
            isDeleting = this._listForm.current.state.isDeleting;
        }*/

        if (this._listForm.current) {
            item = this._listForm.current.state.item;
        }

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
        let items = [];
        let { item } = this.props;
        const { mode, isRefreshing, isDeleting, isSaving, isLoaded } = this.state;
        if (this._listForm.current) {
            item = this._listForm.current.state.item;
        }
        //let isLoading = false;
        //if (this._listForm.current) {
        //isSaving = this._listForm.current.state.isSaving;
        //isDeleting = this._listForm.current.state.isDeleting;
        //isLoading = this._listForm.current.state.isLoading;
        //}
       
        if (item && (mode === 0 || mode === 1)) {
            items.push({
                key: 'refresh',
                icon: 'Refresh',
                text: '',
                disabled: isDeleting || isSaving || /*isLoading*/ /*!isLoaded ||*/ isRefreshing,
                onClick: (e, sender) => this._refresh(),
                iconProps: {
                    iconName: 'Refresh'
                },
                ariaLabel: 'Refresh'
            });
        }
        return items;
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
            this.setState({ showPanel: false, isDirty: false, isValid: false, commandBar: undefined, isSaving: false, isDeleting: false, isRefreshing: false, isLoaded: false });
        }
    };

    _validate = (isValid, isDirty) => {
        if (this.state.isValid !== isValid || this.state.isDirty !== isDirty) {
            this.setState({ isValid: isValid, isDirty: isDirty, commandBar: undefined });
        }
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