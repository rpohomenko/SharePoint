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
            ...this.props
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
                //this.setState({ isDirty: false }, () => {
                if (typeof onItemSaving === "function") {
                    onItemSaving(sender, item);
                }
                //});
            },
            (sender, item) => {
                this.setState({ item: item, confirmClosePanel: false },
                    () => {
                        this.setState({ isDirty: false }, () => {
                            if (typeof onItemSaved === "function") {
                                onItemSaved(sender, item);
                            }
                        });
                    });
            },
            (sender, item) => {
                //this.setState({ isDirty: false }, () => {
                if (typeof onItemDeleting === "function") {
                    onItemDeleting(sender, item);
                }
                // });
            },
            (sender, item) => {
                this.setState({ item: undefined, itemId: undefined }, () => {
                    if (typeof (onItemDeleted) === "function") {
                        onItemDeleted(sender, item);
                    }
                });
            },
            (sender, item) => {
                this.setState({ item: item }, () => {
                    this.setState({ isDirty: false }, () => {
                        if (typeof (onItemLoaded) === "function") {
                            onItemLoaded(sender, item);
                        }
                    });
                });
            });

        return (
            <div className="listform-panel-container" ref={this._container}>
                {showPanel && (<Panel
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
                </Panel>)}
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
        const { isValid, isDirty, mode } = this.state;
        let isBusy = false;
        if (this._listForm.current) {
            isBusy = this._listForm.current.state.isSaving || this._listForm.current.state.isDeleting;
        }
        return (
            <div>
                {mode > 0 && <PrimaryButton onClick={() => this._onSaveClick()} disabled={isBusy || !isDirty || !isValid} style={{ marginRight: 7 }}>Save</PrimaryButton>}
                <DefaultButton onClick={() => this.close()}>{mode > 0 ? "Cancel" : "Close"}</DefaultButton>
            </div>);

    }

    _getCommandItems() {
        const { item, mode, isValid, isDirty } = this.state;
        let isDeleting, isSaving;
        if (this._listForm.current) {
            isSaving = this._listForm.current.state.isSaving;
            isDeleting = this._listForm.current.state.isDeleting;
        }

        let items = [];

        if (item && mode === 0) {
            items.push(
                {
                    key: 'editItem',
                    icon: 'Edit',
                    text: '',
                    disabled: !!(isDeleting || isSaving),
                    onClick: (e, sender) => this.changeMode(1),
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
                    disabled: !!(isDeleting || isSaving),
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
        else if (mode === 2 || (item && mode === 1)) {
            items.push(
                {
                    key: 'saveItem',
                    icon: 'Save',
                    text: '',
                    disabled: !!(isDeleting || isSaving) || !(isValid && isDirty),
                    onClick: (e, sender) => {
                        this._onSaveClick();
                    },
                    iconProps: {
                        iconName: 'Save'
                    },
                    ariaLabel: 'Save'
                });
        }

        return items;
    }

    _getCommandFarItems() {
        let isDeleting, isSaving, isLoading;
        if (this._listForm.current) {
            isSaving = this._listForm.current.state.isSaving;
            isDeleting = this._listForm.current.state.isDeleting;
            isLoading = this._listForm.current.state.isLoading;
        }
        const { mode, isRefreshing } = this.state;
        if (mode === 0 || mode === 1) {
            return [{
                key: 'refresh',
                icon: 'Refresh',
                text: '',
                disabled: isDeleting || isSaving || isLoading || isRefreshing,
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