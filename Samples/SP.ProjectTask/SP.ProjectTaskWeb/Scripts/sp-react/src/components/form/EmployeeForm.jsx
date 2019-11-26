import * as React from 'react';
import { ListForm } from './ListForm';
import { DepartmentList } from '../lists/Departments';
import { EmployeeList } from '../lists/Employees';

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
            required: true
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
            type: 'text',
            title: 'Position'           
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
            title: 'Manager',
            getListView: (commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
                return <EmployeeList service={this._service} pageSize={10} isMultipleSelection={true} commandItems={commandItems} emptyMessage="There are no employees." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
            }         
        },
        {
            key: 'department',
            name: 'Department',
            type: 'lookup',
            isMultiple: false,
            title: 'Department',
            getListView: (commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
                return <DepartmentList service={this._service} pageSize={10} isMultipleSelection={false} commandItems={commandItems} emptyMessage="There are no departments." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
            }          
        },
        {
            key: 'description',
            name: 'Description',
            type: 'text',
            title: 'Description'           
        },
        ];
    }
}

export default EmployeeForm;