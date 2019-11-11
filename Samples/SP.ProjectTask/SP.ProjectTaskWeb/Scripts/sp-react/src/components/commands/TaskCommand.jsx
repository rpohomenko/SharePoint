import React from "react";
import TaskForm from "../form/TaskForm";
import BaseListViewCommand from "./BaseListViewCommand";

export class TaskCommand extends BaseListViewCommand {

    constructor(props) {
        super(props);
        this.state = {
            ...this.state
        };
    }

    _onNewItem = () => {
        const listForm = <TaskForm ref={(ref) => this._panel._listForm = ref} service={this.props.service} mode={2} />
        this._panel.setState({ listForm: listForm, showPanel: true });
    }

    _onEditItem = (item) => {
        const listForm = <TaskForm ref={(ref) => this._panel._listForm = ref} service={this.props.service} mode={1} itemId={item.Id} />
        this._panel.setState({ listForm: listForm, showPanel: true });
    }

    _onDelete = (items) => {

    }

    _onViewItem = (item) => {
        const listForm = <TaskForm ref={(ref) => this._panel._listForm = ref} service={this.props.service} mode={0} itemId={item.Id} />
        this._panel.setState({ listForm: listForm, showPanel: true });
    }

    _getItems() {
        let commands = super._getItems();
        return commands;
    }

    render() {
        return super.render();
    }
}

export default TaskCommand;