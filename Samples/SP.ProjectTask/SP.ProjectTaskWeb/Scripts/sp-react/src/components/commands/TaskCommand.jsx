import React from "react";
import TaskForm from "../form/TaskForm";
import BaseListViewCommand from "./BaseListViewCommand";
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Callout } from 'office-ui-fabric-react';

export class TaskCommand extends BaseListViewCommand {

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

    _getForm = (mode, onValidate, onChangeMode, onCloseForm) => {
        const { onItemDeleted, onItemSaved } = this.props;
        const { selection } = this.state;
        let item = selection && selection.length > 0 ? selection[0] : undefined;
        return (<TaskForm ref={(ref) => this._listForm = ref} service={this.props.service} mode={mode} isValid={mode === 2} isDirty={mode === 2} itemId={item ? item.Id : undefined}
            onValidate={onValidate} onChangeMode={onChangeMode} onCloseForm={(sender) => onCloseForm(null)}
            onItemDeleted={(sender, item) => onCloseForm({ ok: true, data: [item] }, "Deleted successfully.", onItemDeleted)}
            onItemSaved={(sender, item) => onCloseForm({ ok: true, data: item, isNewItem: mode === 2 }, "Saved successfully.", onItemSaved)} />);
    }

    _onDelete = (items) => {
        const { onItemDeleted } = this.props;
        this.setState({ isDeleting: true, status: undefined });
        let ids = [];
        if (items) {
            for (let i = 0; i < items.length; i++) {
                ids.push(items[i].Id);
            }
        }

        let promise = this.props.service.deleteTask(ids);
        let status = this._status;
        return this._onPromise(promise, (result) => {
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
}

export default TaskCommand;