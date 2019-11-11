import React from "react";
//import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import ListFormPanel from "../form/ListFormPanel";

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
    }

    render() {       
        return (
            <div className="command-container">
                <OverflowSet styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                    items={this._getItems()}
                    onRenderOverflowButton={this._onRenderOverflowButton}
                    onRenderItem={this._onRenderItem}
                />
                <ListFormPanel ref={ref => this._panel = ref} />
            </div>
        );
    }

    _onNewItem = () => {
        throw "Method _onNewItem is not yet implemented!";
    }

    _onEditItem = (item) => {
        throw "Method _onEditItem is not yet implemented!";
    }

    _onDelete = (items) => {
        throw "Method _onDelete is not yet implemented!";
    }

    _onViewItem = (item) => {
        throw "Method _onViewItem is not yet implemented!";
    }

    viewItem(item) {
        this._onViewItem(item);
    }

    editItem(item) {        
        this._onEditItem(item);
    }

     deleteItem(items) {        
        this._onDelete(items);
    }

    _getItems() {
        const { selection } = this.state;
        let items = [];
        items.push(
            {
                key: 'newItem',
                icon: 'Add',
                name: 'New',
                onClick: (e, sender) => this._onNewItem(),
                iconProps: {
                    iconName: 'Add'
                },
                ariaLabel: 'New'
            });
        if (selection) {
            if (selection.length === 1) {
                items.push(
                    {
                        key: 'viewItem',
                        icon: 'View',
                        name: 'View',
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
                            name: 'Edit',
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
                        name: 'Delete',
                        onClick: (e, sender) => this._onDelete(selection),
                        iconProps: {
                            iconName: 'Delete'
                        },
                        ariaLabel: 'Delete'
                    });
            }
        }
        return items;
    }

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
}

export default BaseListViewCommand;