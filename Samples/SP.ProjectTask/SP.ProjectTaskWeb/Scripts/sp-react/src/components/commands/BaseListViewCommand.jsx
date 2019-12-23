import React from "react";
import PropTypes from 'prop-types';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { isArray } from "util";

import { StatusBar } from '../StatusBar';
import { SearchField } from '../search/SearchField';

export class BaseListViewCommand extends React.Component {

    constructor(props) {
        super(props);
        this._onNewItem = this._onNewItem.bind(this);
        this._onEditItem = this._onEditItem.bind(this);
        this._onViewItem = this._onViewItem.bind(this);
        this._onDelete = this._onDelete.bind(this);
        this._getItems = this._getItems.bind(this);
        this._service = props.service;
        this.state = {
            ...this.props,
            refreshEnabed: false,
            newItemEnabled: false,
            isDeleting: false,
            confirmDeletion: false
        };

        this._container = React.createRef();
        this._panel = React.createRef();
    }

    componentWillUnmount() {
    }

    _onSetFilter = () => {
        const { onSetFilter } = this.props;
        if (typeof onSetFilter === "function") {
            onSetFilter();
        }
    }
    _onClearFilter = () => {
        const { onClearFilter } = this.props;
        if (typeof onClearFilter === "function") {
            onClearFilter();
        }
    }

    render() {
        const { canAddListItems, onItemSaving, onItemSaved, onItemDeleting, onItemDeleted } = this.props;
        const { selection, confirmDeletion } = this.state;
        let item = selection && selection.length > 0 ? selection[0] : undefined;
        return (
            <div className="command-container" ref={this._container}>
                <CommandBar ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                    items={this._getItems()}
                    farItems={this._getFarItems()}
                    onRenderOverflowButton={this._renderOverflowButton}
                    onRenderItem={this._renderItem} />
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
                            this._onDelete(selection, this._onPromise);
                            this.setState({ confirmDeletion: false });
                        }} text="Yes" />
                        <DefaultButton onClick={() => this.setState({ confirmDeletion: false })} text="No" />
                    </DialogFooter>
                </Dialog>
                {this._renderListFormPanel(item, this._panel, this._service, canAddListItems, onItemSaving, onItemSaved, onItemDeleting, onItemDeleted)}
                <StatusBar ref={ref => this._status = ref} />
            </div>
        );
    }

    viewItem(item) {
        this._onViewItem(item);
    }

    editItem(item) {
        this._onEditItem(item);
    }

    deleteItem(items) {
        if (items.length > 0) {
            this.setState({ confirmDeletion: true });
        }
    }

    refresh() {
        const { onRefresh } = this.props;
        this._onClearSelection();
        if (typeof onRefresh === "function") {
            onRefresh();
        }
    }

    _onSearch(expr, field) {
        const { onSearch } = this.props;
        if (typeof onSearch === "function") {
            onSearch(expr, field);
        }
    }

    _renderListFormPanel = (item, ref, service, onItemSaving, onItemSaved, onItemDeleting, onItemDeleted) => {
        throw "Method _renderListFormPanel is not yet implemented!";
    }

    _renderItem = (item) => {
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

    _renderOverflowButton = (overflowItems) => {
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

    _onClearSelection = () => {
        const { onClearSelection } = this.props;
        this.setState({ selection: null }, () => {
            if (typeof onClearSelection === "function") {
                onClearSelection();
            }
        });
    }

    _getFarItems() {
        const { clearFilterShown } = this.props;
        const { selection, isDeleting, refreshEnabed } = this.state;
        let items = [];
        if (selection && selection.length > 0) {
            items.push({
                key: 'clear',
                icon: 'Clear',
                text: "{0} selected".format(selection.length),
                iconOnly: false,
                disabled: selection.length === 0,
                onClick: (e, sender) => this._onClearSelection(),
                iconProps: {
                    iconName: 'Clear'
                },
                ariaLabel: 'Clear'
            });
        }

        items.push({
            key: 'filter',
            icon: 'Filter',
            text: 'Open Filter',
            iconOnly: true,
            disabled: !refreshEnabed || isDeleting,
            onClick: (e, sender) => this._onSetFilter(),
            iconProps: {
                iconName: 'Filter'
            },
            ariaLabel: 'Filter'
        });

        if (clearFilterShown) {
            items.push({
                key: 'clearFilter',
                icon: 'ClearFilter',
                text: 'Clear Filter',
                iconOnly: true,
                disabled:  !refreshEnabed || !clearFilterShown,
                onClick: (e, sender) => this._onClearFilter(),
                iconProps: {
                    iconName: 'ClearFilter'
                },
                ariaLabel: 'Clear Filter'
            });
        }
        items.push(
            {
                key: 'refresh',
                icon: 'Refresh',
                text: 'Refresh',
                iconOnly: true,
                disabled: !refreshEnabed || isDeleting,
                onClick: (e, sender) => this.refresh(),
                iconProps: {
                    iconName: 'Refresh'
                },
                ariaLabel: 'Refresh'
            });
        return items;
    }

    _getItems() {
        const { commandItems, canAddListItems, searchField } = this.props;
        const { selection, isDeleting, newItemEnabled } = this.state;
        let items = []
        if (isArray(commandItems)) {
            items = items.concat(commandItems);
        }
        let canCreate = canAddListItems,
            canUpdate = true, canDelete = true;
        if (selection)
            for (let i = 0; i < selection.length; i++) {
                if (!selection[i].CanCreate && canCreate) {
                    canCreate = false;
                }
                if (!selection[i].CanUpdate && canUpdate) {
                    canUpdate = false;
                }
                if (!selection[i].CanDelete && canDelete) {
                    canDelete = false;
                }
            }

        items.push(
            {
                key: 'newItem',
                icon: 'Add',
                text: 'New Item',
                iconOnly: true,
                disabled: !canCreate || isDeleting || !newItemEnabled,
                onClick: (e, sender) => this._onNewItem(),
                iconProps: {
                    iconName: 'Add'
                },
                ariaLabel: 'New'
            });
        if (searchField) {
            items.push({
                key: 'search',
                onRender: () => {
                    return (
                        <SearchField ref={ref => this._searchField = ref}
                            key={"searchField"}
                            fieldProps={{
                                ...searchField,
                                type: 'search',
                                onSearch: (term) => {
                                    if (this._searchField) {
                                        this._onSearch(this._searchField.getFilterExpr(), this._searchField.getFieldProps());
                                    }
                                }
                            }}
                        />
                    );
                }
            });
        }

        items.push(
            {
                key: 'viewItem',
                icon: 'View',
                text: 'View Item',
                iconOnly: true,
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
                text: 'Edit Item',
                iconOnly: true,
                disabled: !canUpdate || isDeleting || (!selection || selection.length !== 1),
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
                text: 'Delete Item(s)',
                iconOnly: true,
                disabled: !canDelete || isDeleting || (!selection || selection.length === 0),
                onClick: (e, sender) => this.deleteItem(selection),
                iconProps: {
                    iconName: 'Delete'
                },
                ariaLabel: 'Delete'
            });
        return items;
    }

    _onNewItem = () => {
        this._showPanel(2);
    }

    _onEditItem = (item) => {
        this._showPanel(1);
    }

    _onViewItem = (item) => {
        this._showPanel(0);
    }

    _onDelete = (items, onPromise) => {
        throw "Method _onDelete is not yet implemented!";
    }

    _showPanel = (mode) => {
        if (this._panel.current) {
            this._panel.current.open(mode);
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