import * as React from 'react';
import { ListForm } from './ListForm';
import { ProjectList } from '../lists/Projects';

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
        let service = this._service;   
        return [{
            key: 'title',
            name: 'Title',
            type: 'text',
            title: 'Title',
            required: true
        },
        {
            key: 'project',
            name: 'Project',
            type: 'lookup',
            title: 'Project',
            lookupList: 'Projects',
            lookupField: 'Title',
            isMultiple: false,
            required: true,
            getListView: (commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
              return <ProjectList service={service} pageSize={10} isMultipleSelection={false} commandItems={commandItems} emptyMessage="There are no projects." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
            }
        }];
    }

    _getCommandItems() {
        let commands = super._getCommandItems();
        return commands;
    }
}

export default TaskForm;