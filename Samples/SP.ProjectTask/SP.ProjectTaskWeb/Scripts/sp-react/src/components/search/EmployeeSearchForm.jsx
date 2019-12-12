import * as React from 'react';
import PropTypes from 'prop-types';

import { SearchForm } from './SearchForm';
import { EmployeeList } from '../lists/Employees';
import { DepartmentList } from '../lists/Departments';

export class EmployeeSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }

    _getFields = () => {
        return [/*{
            key: 'title',
            name: 'Title',
            type: 'text',
            title: 'Title'           
        },*/
            {
                key: 'firstName',
                name: 'FirstName',
                type: 'text',
                title: 'First Name',           
                description: "First Name"
            },
            {
                key: 'lastName',
                name: 'LastName',
                type: 'text',
                title: 'Last Name'              
            },
            {
                key: 'account',
                name: 'AccountLookup',
                type: 'user',
                title: 'Account',              
                limitResults: 5,
                isMultiple: true,
                notLookupInclude: true,
                getPersonas: (searchTerm, limitResults, options) => { return this._service.getUsers(searchTerm, limitResults, options); },
            },
            {
                key: 'position',
                name: 'EmployeePosition',
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
                name: 'Managers',
                type: 'lookup',
                isMultiple: true,
                lookupList: 'Employees',
                lookupField: 'Title',
                title: 'Manager',
                renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) =>
                    this._renderEmployeeListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
                getItems: (searchTerm, limitResults, options)=>{ return this._service.getEmployees(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, ['Id', 'Title'], options);}
            },
            {
                key: 'department',
                name: 'DepartmentLookup',
                type: 'lookup',
                isMultiple: true,
                notLookupInclude: true,
                title: 'Department',
                lookupList: 'Departments',
                lookupField: 'Title',
                renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) =>
                    this._renderDepartmentListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
                getItems: (searchTerm, limitResults, options)=>{ return this._service.getDepartments(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, ['Id', 'Title'], options);}
            }           
        ];
    }

    _renderEmployeeListView = (ref, isMultiple, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
        return <EmployeeList ref={ref} service={this._service} pageSize={10} isMultipleSelection={isMultiple} commandItems={commandItems} emptyMessage="There are no employees." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
    }   

    _renderDepartmentListView = (ref, isMultiple, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
        return <DepartmentList ref={ref} service={this._service} pageSize={10} isMultipleSelection={isMultiple} commandItems={commandItems} emptyMessage="There are no departments." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
    }
}

export default EmployeeSearchForm;