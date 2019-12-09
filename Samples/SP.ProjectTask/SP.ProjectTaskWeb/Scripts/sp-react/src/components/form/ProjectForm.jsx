import * as React from 'react';
import { ListForm } from './ListForm';
import { EmployeeList } from '../lists/Employees';
import { EmployeeFormPanel } from "./EmployeeFormPanel";

export class ProjectForm extends ListForm {

    constructor(props) {
        super(props);

        this.state = {
            ...props
        };
    }

    _fetchData = async (itemId, options) => {
        return await this._service.getProject(itemId, options);
    }

    _saveData = async (item, options) => {
        return await this._service.saveProject(item, options);
    }

    _deleteItem = async (item, options) => {
        return await this._service.deleteProject([item.Id], options);
    }

    render() {
        return super.render();
    }

    _renderEmployeeListForm = (ref) => {
        return (<EmployeeFormPanel ref={ref} service={this._service}
            viewItemHeader="View Employee" editItemHeader="Edit Employee" newItemHeader="New Employee"
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

    _renderEmployeeListView = (ref, isMultiple, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
        return <EmployeeList ref={ref} service={this._service} pageSize={10} isMultipleSelection={isMultiple} commandItems={commandItems} emptyMessage="There are no employees." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
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
            key: 'manager',
            name: 'Manager',
            type: 'lookup',
            title: 'Manager',
            lookupList: 'Employees',
            lookupField: 'Title',
            isMultiple: true,
            renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => 
                            this._renderEmployeeListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
            renderListForm: (ref) => this._renderEmployeeListForm(ref),
            getItems: (searchTerm, limitResults, options)=>{ return this._service.getEmployees(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, options);}
        },
        {
            key: 'developer',
            name: 'Developer',
            type: 'lookup',
            title: 'Developer',
            lookupList: 'Employees',
            lookupField: 'Title',
            isMultiple: true,
            renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => 
                            this._renderEmployeeListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
            renderListForm: (ref) => this._renderEmployeeListForm(ref),
            getItems: (searchTerm, limitResults, options)=>{ return this._service.getEmployees(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, options);}
        },
        {
            key: 'tester',
            name: 'Tester',
            type: 'lookup',
            title: 'Tester',
            lookupList: 'Employees',
            lookupField: 'Title',
            isMultiple: true,
            renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => 
                            this._renderEmployeeListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
            renderListForm: (ref) => this._renderEmployeeListForm(ref),
            getItems: (searchTerm, limitResults, options)=>{ return this._service.getEmployees(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, options);}
        }
        ];
    }
}

export default ProjectForm;