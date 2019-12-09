import * as React from 'react';
import { ListForm } from './ListForm';
import { ProjectList } from '../lists/Projects';
import { ProjectFormPanel } from './ProjectFormPanel';

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
            renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) =>
                this._renderProjectListView(ref, false, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
            renderListForm: (ref) => this._renderProjectListForm(ref),
            getItems: (searchTerm, limitResults, options)=>{ return this._service.getProjects(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, ['Id', 'Title'], options);}
        },
        {
            key: 'assignedTo',
            name: 'AssignedTo',
            type: 'user',
            title: 'Assigned To',
            required: true,
            isMultiple: true,
            limitResults: 5,
            itemLimit: 5,
            getPersonas: (searchTerm, limitResults, options)=>{ return this._service.getUsers(searchTerm, limitResults, options);}
        },
        {
            key: 'status',
            name: 'TaskStatus',
            type: 'choice',
            title: 'Status',
            choices: [
                { value: "Not Started", key: 1 },
                { value: "In Progress", key: 2 },
                { value: "Completed", key: 3 }
            ]
        },
        {
            key: 'startDate',
            name: 'StartDate',
            type: 'datetime',
            title: 'Start Date',
            onChangeValue: (sender, value) => {
                this._onChangeStartDate(value);
            }
        },
        {
            key: 'endDate',
            name: 'DueDate',
            type: 'datetime',
            title: 'End Date',
            onChangeValue: (sender, value) => {
                this._onChangeEndDate(value);
            }
        },
        {
            key: 'body',
            name: 'Body',
            type: 'richtext',
            title: 'Body'            
        },
        ];
    }

    _onChangeStartDate(startDate) {
        let endField = this.getFormField('DueDate');
        if (endField && endField.getControl()) {
            let endDate = endField.getControl().getDate();   
            if (!endDate || endDate < startDate) {
                endField.setFieldValue(startDate);
            }
        }
    }

    _onChangeEndDate(endDate) {
        let startField = this.getFormField('StartDate');
        if (startField && startField.getControl()) {
            let startDate = startField.getControl().getDate() || endDate;
            if (!startDate || endDate < startDate) {
                startField.setFieldValue(endDate);
            }
        }
    }

    _renderProjectListForm = (ref) => {
        return (<ProjectFormPanel ref={ref} service={this._service}
            viewItemHeader="View Project" editItemHeader="Edit Project" newItemHeader="New Project"
            onItemDeleted={() => {
                this.loadItem(this.props.item.Id);
                if (this._status) {
                    this._status.success("Deleted successfully.", this.props.STATUS_TIMEOUT);
                }
            }}
            onItemSaved={() => {
                this.loadItem(this.props.item.Id);
                if (this._status) {
                    this._status.success("Saved successfully.", this.props.STATUS_TIMEOUT);
                }
            }}
            onItemLoaded={(sender, item) => {

            }}
        />);
    }

    _renderProjectListView = (ref, isMultiple, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
        return <ProjectList ref={ref} service={this._service} pageSize={10} isMultipleSelection={isMultiple} commandItems={commandItems} emptyMessage="There are no projects." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
    }

    _getCommandItems() {
        let commands = super._getCommandItems();
        return commands;
    }
}

export default TaskForm;