import React from "react";
import TaskForm from "../form/TaskForm";
import BaseListViewCommand from "./BaseListViewCommand";
//import { getItemClassNames } from "office-ui-fabric-react/lib/components/ContextualMenu/ContextualMenu.classNames";
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

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
            {isDeleting && (<Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}>
                <ProgressIndicator label={"Deleting..."} />
            </Stack>)}
        </div>);
    }

    _onNewItem = () => {
        let panel = this._panel;
        const listForm = <TaskForm ref={(ref) => this._panel._listForm = ref} service={this.props.service} mode={2} onValidate={(form, isValid, isDirty) => {
            panel.setState({ isValid: isValid, isDirty: isDirty });
        }} />
        panel.setState({ listForm: listForm, showPanel: true });
    }

    _onEditItem = (item) => {
        let panel = this._panel;
        const listForm = <TaskForm ref={(ref) => this._panel._listForm = ref} service={this.props.service} mode={1} itemId={item.Id} onValidate={(form, isValid, isDirty) => {
            panel.setState({ isValid: isValid, isDirty: isDirty });
        }} />
        panel.setState({ listForm: listForm, showPanel: true });
    }

    _onDelete = (items) => {
        this.setState({ isDeleting: true });
        let ids = [];        
        if (items) {
            for (let i = 0; i < items.length; i++) {
                ids.push(items[i].Id);
            }
        }
        let promise = this.props.service.deleteTask(ids);
        return promise.then(response => {
            if (response.status === 400) {
                return response.json().then((error) => {
                    alert(error.message);
                    return 0; //error
                });
            }
            return response.json().then((result) => {
                if (result) {
                    this.refresh();
                    this.setState({ itemsToDelete: null, isDeleting: false });
                }
                return 1; // OK
            });
        });
    }

    _onViewItem = (item) => {
        const listForm = <TaskForm ref={(ref) => this._panel._listForm = ref} service={this.props.service} mode={0} itemId={item.Id} />
        this._panel.setState({ listForm: listForm, showPanel: true });
    }

    _getItems() {
        let commands = super._getItems();
        return commands;
    }
}

export default TaskCommand;