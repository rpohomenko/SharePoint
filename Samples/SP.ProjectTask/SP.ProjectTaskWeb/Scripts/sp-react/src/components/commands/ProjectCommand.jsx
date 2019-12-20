import React from "react";
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Callout } from 'office-ui-fabric-react';

import ProjectFormPanel from "../form/ProjectFormPanel";
import BaseListViewCommand from "./BaseListViewCommand";

export class ProjectCommand extends BaseListViewCommand {

    constructor(props) {
        super(props);
        this.state = {
            ...this.state
        };
    }

    render() {
        const { isDeleting } = this.state;
        return (<div>
            {super.render()}
            {isDeleting && (
                <Callout
                    target={this._container.current}
                    setInitialFocus={true}>
                    <Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}>
                        <ProgressIndicator label={"Deleting..."} />
                    </Stack>
                </Callout>)}
        </div>);
    }

    _renderListFormPanel = (item, ref, service, canAddListItems, onItemSaving, onItemSaved, onItemDeleting, onItemDeleted) => {
        return (<ProjectFormPanel item={item} service={service} canAddListItems={canAddListItems} ref={ref} onRenderListForm={this._renderListForm}
            onItemSaving={onItemSaving} onItemSaved={(sender, result) => {
                if (this._status) {
                    this._status.success("Saved successfully.", this.props.STATUS_TIMEOUT);
                }
                if (typeof onItemSaved === "function") {
                    onItemSaved(sender, result);
                }
            }}
            onItemDeleting={onItemDeleting} onItemDeleted={(sender, result) => {
                if (this._status) {
                    this._status.success("Deleted successfully.", this.props.STATUS_TIMEOUT);
                }
                if (typeof onItemDeleted === "function") {
                    onItemDeleted(sender, result);
                }
            }}
            viewItemHeader="View Project" editItemHeader="Edit Project" newItemHeader="New Project" />);
    }

    _onDelete = (items, onPromise) => {
        const { onItemDeleted, onItemDeleting } = this.props;
        this.setState({ isDeleting: true, status: undefined },
            () => {
                if (typeof onItemDeleting === "function") {
                    onItemDeleting(this, items);
                }
            });
        let ids = [];
        if (items) {
            for (let i = 0; i < items.length; i++) {
                ids.push(items[i].Id);
            }
        }

        let promise = this.props.service.deleteProject(ids);
        let status = this._status;
        return onPromise(promise, (result) => {
            if (result) {
                if (status) {
                    status.success("Deleted successfully.", this.props.STATUS_TIMEOUT);
                }
                if (typeof (onItemDeleted) === "function") {
                    onItemDeleted(this, { ok: true, data: items });
                }
                return { ok: true, data: items };
            }
            throw `Cannot delete item(s) with Id=[${ids.join(',')}]`;
        }).then(result => {
            this.setState({ isDeleting: false });
            return result;
        });
    }

    _getItems() {
        let commands = super._getItems();
        return commands;
    }

    _getFarItems() {
        const { isCompactList } = this.state;
        let commands = super._getFarItems();
        commands.push(
            {
                key: 'view',
                icon: isCompactList ? 'AlignRight' : 'ListMirrored',
                text: 'View',
                iconOnly: true,
                subMenuProps: {
                    items: [
                        {
                            key: 'list',
                            text: 'List',
                            canCheck: true,
                            icon: 'ListMirrored',
                            isChecked: !isCompactList,
                            iconProps: {
                                iconName: 'ListMirrored'
                            },
                            onClick: () => { this._onViewChanged(false); }
                        },
                        {
                            key: 'compactlist',
                            text: 'Compact List',
                            canCheck: true,
                            icon: 'AlignRight',
                            isChecked: isCompactList,
                            iconProps: {
                                iconName: 'AlignRight'
                            },
                            onClick: () => { this._onViewChanged(true); }
                        }]
                },
                iconProps: {
                    iconName: isCompactList ? 'AlignRight' : 'ListMirrored'
                },
                ariaLabel: 'List'
            });
        return commands;
    }

    _onViewChanged = (changedCompactList) => {
        const { onViewChanged } = this.props;
        const { isCompactList } = this.state;
        if (isCompactList !== changedCompactList) {
            this.setState({ isCompactList: changedCompactList }, () => {
                if (typeof onViewChanged === "function") {
                    onViewChanged(changedCompactList);
                }
            });
        }
    }
}

export default ProjectCommand;