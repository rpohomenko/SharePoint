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
        const listForm = <TaskForm mode={2} />
        this._listform.setState({ listForm: listForm, showPanel: true });
    }

    _onEditItem = (item) => {
        const listForm = <TaskForm mode={1} itemId={item.Id} />
        this._listform.setState({ listForm: listForm, showPanel: true });
    }

    _onDelete = (items) => {
       
    }

    _onViewItem = (item) => {
        const listForm = <TaskForm mode={0} itemId={item.Id} />
        this._listform.setState({ listForm: listForm, showPanel: true });
    }

    _getItems(){
        let commands = super._getItems();
        return commands;
    }

    render() {
        return super.render();
    }
}

export default TaskCommand;