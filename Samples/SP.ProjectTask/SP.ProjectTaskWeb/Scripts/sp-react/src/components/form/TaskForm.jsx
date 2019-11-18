//import * as React from 'react';
import { ListForm } from './ListForm';

export class TaskForm extends ListForm {

    constructor(props) {
        super(props);

        this.state = {
            ...props
        };
    }

    _fetchData = async (itemId, options) => {
        return await this._service.getTask(itemId, options);
    }

    _saveData = async (item, options) => {
        return await this._service.saveTask(item, options);
    }

    _deleteItem = async (item, options) => {
        return await this._service.deleteTask([item.Id], options);
    }

    render() {
        return super.render();
    }

    _getFields = () => {
        return [{
            key: 'Title',
            name: 'Title',
            type: 'text',
            title: 'Title',
            required: true
        }];
    }
}

export default TaskForm;