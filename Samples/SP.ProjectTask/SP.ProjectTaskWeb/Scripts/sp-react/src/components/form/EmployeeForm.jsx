import * as React from 'react';
import { ListForm } from './ListForm';
import { DepartmentList } from '../lists/Departments';
import { DepartmentFormPanel } from './DepartmentFormPanel';
import { EmployeeList } from '../lists/Employees';
import { EmployeeFormPanel } from './EmployeeFormPanel';

export class EmployeeForm extends ListForm {

    constructor(props) {
        super(props);

        this.state = {
            ...props
        };
    }

    _fetchData = async (itemId, options) => {
        return await this._service.getEmployee(itemId, options);
    }

    _saveData = async (item, options) => {
        return await this._service.saveEmployee(item, options);
    }

    _deleteItem = async (item, options) => {
        return await this._service.deleteEmployee([item.Id], options);
    }

    render() {
        return super.render();
    }

    _getFields = () => {
        return [/*{
            key: 'title',
            name: 'Title',
            type: 'text',
            title: 'Title',
            required: true
        },*/
            {
                key: 'firstName',
                name: 'FirstName',
                type: 'text',
                title: 'First Name',
                required: true,
                description: "First Name"
            },
            {
                key: 'lastName',
                name: 'LastName',
                type: 'text',
                title: 'Last Name',
                required: true
            },
            {
                key: 'account',
                name: 'Account',
                type: 'text',
                title: 'Account',
                //required: true
            },
            {
                key: 'position',
                name: 'Position',
                type: 'choice',
                isMultiple: true,
                title: 'Position',
                choices: [
                    { value: "Web developer", key: 1 },
                    { value: "Project manager", key: 2 },
                    { value: "Software tester", key: 4 },
                    { value: "Technical consultant", key: 8 },
                    { value: "Business analyst", key: 16 }
                ]
            },
            {
                key: 'phone',
                name: 'Phone',
                type: 'text',
                title: 'Phone'
            },
            {
                key: 'email',
                name: 'Email',
                type: 'text',
                title: 'Email'
            },
            {
                key: 'manager',
                name: 'Manager',
                type: 'lookup',
                isMultiple: true,
                lookupList: 'Employees',
                lookupField: 'Title',
                title: 'Manager',
                renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) =>
                    this._renderEmployeeListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
                renderListForm: (ref) => this._renderEmployeeListForm(ref)
            },
            {
                key: 'department',
                name: 'Department',
                type: 'lookup',
                isMultiple: false,
                title: 'Department',
                lookupList: 'Departments',
                lookupField: 'Title',
                renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) =>
                    this._renderDepartmentListView(ref, false, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
                renderListForm: (ref) => this._renderDepartmentListForm(ref)
            },
            {
                key: 'description',
                name: 'Description',
                type: 'richtext',
                title: 'Description',
                isMultiLine: true
            },
        ];
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
        />);
    }

    _renderEmployeeListView = (ref, isMultiple, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
        return <EmployeeList ref={ref} service={this._service} pageSize={10} isMultipleSelection={isMultiple} commandItems={commandItems} emptyMessage="There are no employees." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
    }

    _renderDepartmentListForm = (ref) => {
        return (<DepartmentFormPanel ref={ref} service={this._service}
            viewItemHeader="View Department" editItemHeader="Edit Department" newItemHeader="New Department"
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
        />);
    }

    _renderDepartmentListView = (ref, isMultiple, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
        return <DepartmentList ref={ref} service={this._service} pageSize={10} isMultipleSelection={isMultiple} commandItems={commandItems} emptyMessage="There are no departments." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
    }
}

export default EmployeeForm;