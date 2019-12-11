import * as React from 'react';
import PropTypes from 'prop-types';

import { SearchForm } from './SearchForm';
import { EmployeeList } from '../lists/Employees';

export class ProjectSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }  

    _renderEmployeeListView = (ref, isMultiple, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
        return <EmployeeList ref={ref} service={this._service} pageSize={10} isMultipleSelection={isMultiple} commandItems={commandItems} emptyMessage="There are no employees." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
    }

    _getFields = () => {
        return [{
            key: 'title',
            name: 'Title',
            type: 'text',
            title: 'Title'          
        },
        {
            key: 'manager',
            name: 'Managers',
            type: 'lookup',
            title: 'Manager',
            lookupList: 'Employees',
            lookupField: 'Title',
            isMultiple: true,
            renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => 
                            this._renderEmployeeListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
            renderListForm: (ref) => this._renderEmployeeListForm(ref),
            getItems: (searchTerm, limitResults, options)=>{ return this._service.getEmployees(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, ['Id', 'Title'], options);}
        },
        {
            key: 'developer',
            name: 'Developers',
            type: 'lookup',
            title: 'Developer',
            lookupList: 'Employees',
            lookupField: 'Title',
            isMultiple: true,
            renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => 
                            this._renderEmployeeListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
            renderListForm: (ref) => this._renderEmployeeListForm(ref),
            getItems: (searchTerm, limitResults, options)=>{ return this._service.getEmployees(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, ['Id', 'Title'], options);}
        },
        {
            key: 'tester',
            name: 'Testers',
            type: 'lookup',
            title: 'Tester',
            lookupList: 'Employees',
            lookupField: 'Title',
            isMultiple: true,
            renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => 
                            this._renderEmployeeListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
            getItems: (searchTerm, limitResults, options)=>{ return this._service.getEmployees(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, ['Id', 'Title'], options);}
        }
        ];
    }
}

export default ProjectSearchForm;