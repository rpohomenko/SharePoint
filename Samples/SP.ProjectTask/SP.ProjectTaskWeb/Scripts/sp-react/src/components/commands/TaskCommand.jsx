import React from "react";
import TaskForm from "../form/TaskForm";
import BaseListViewCommand from "./BaseListViewCommand";
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Callout } from 'office-ui-fabric-react';
import { MessageBarType } from 'office-ui-fabric-react';

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

    _getForm = (mode) => {
        const { selection } = this.state;
        let item = selection && selection.length > 0 ? selection[0] : undefined;
        return (<TaskForm ref={(ref) => { if (this._panel) { this._panel._listForm = ref } }} service={this.props.service} mode={mode} itemId={item ? item.Id : undefined}
        onValidate={(sender, isValid, isDirty) => this._validate(isValid, isDirty)} onChangeMode={(sender, mode) => this._changeMode(mode)} onClose={(sender) => this._closeForm(0)}
        onItemDeleted={(sender) => this._closeForm(1, "Deleted successfully.")} onItemSaved = {(sender) => this._closeForm(1,"Saved successfully.")} />);
    }   

    _onDelete = (items) => {
        this.setState({ isDeleting: true, status: undefined });
        let ids = [];
        if (items) {
            for (let i = 0; i < items.length; i++) {
                ids.push(items[i].Id);
            }
        }
        let promise = this.props.service.deleteTask(ids);
        return promise.then(response => {
            if (response.ok) {
                return response.json().then((result) => {
                    if (result) {
                        this.refresh();
                        this.setState({ isDeleting: false, status: { content: "Deleted successfully.", type: MessageBarType.success } });
                    }
                    return 1; // OK
                });
            }
            else {
                return response.json().then((error) => {
                    if (!error || !error.message) {
                        error = { message: `${response.statusText} (${response.status})` };
                    }
                    this.setState({
                        error: error,
                        isDeleting: false
                    });
                    return 0; //error
                }).catch(() => {
                    let error = { message: `${response.statusText} (${response.status})` };
                    this.setState({
                        error: error,
                        isDeleting: false
                    });
                    return 0; //error
                });
            }
        }).catch((error) => {
            this.setState({
                error: error,
                isDeleting: false
            });
        });
    }

    _getItems() {
        let commands = super._getItems();
        return commands;
    }
}

export default TaskCommand;