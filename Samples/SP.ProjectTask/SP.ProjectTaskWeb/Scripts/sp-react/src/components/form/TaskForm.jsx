//import * as React from 'react';
import { ListForm } from './ListForm';

export class TaskForm extends ListForm {

    constructor(props) {
        super(props);

        this.state = {
            ...props
        };
    }

    _fetchData = (itemId, options) => {
        return this._service.getTask(itemId, options);
    }

    _fetchDataAsync = async (itemId, options) => {
        return await this._fetchData(itemId, options);
    }

    _saveData = (item, options) => {
        return this._service.saveTask(item, options);
    }

    _saveDataAsync = async (item, options) => {
        return await this._saveData(item, options);
    }

    _deleteItem =(item, options)=>{
        return this._service.deleteTask([item.Id], options);
    }

    _deleteItemAsync = async (item, options) => {
        return await this._deleteItem(item, options);
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