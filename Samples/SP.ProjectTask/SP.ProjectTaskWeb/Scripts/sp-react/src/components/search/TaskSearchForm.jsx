import * as React from 'react';
import PropTypes from 'prop-types';

import { SearchForm } from './SearchForm';
import { ProjectList } from '../lists/Projects';

export class TaskSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }

    _getFields = () => {
        return [{
            key: 'title',
            name: 'Title',
            type: 'text',
            title: 'Title'
        },
        {
            key: 'project',
            name: 'ProjectLookup',
            type: 'lookup',
            title: 'Project',
            lookupList: 'Projects',
            lookupField: 'Title',
            isMultiple: true,
            notLookupInclude: true,
            renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) =>
                this._renderProjectListView(ref, true, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
            getItems: (searchTerm, limitResults, options) => { return this._service.getProjects(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, ['Id', 'Title'], options); }
        },
        {
            key: 'assignedTo',
            name: 'AssignedToLookup',
            type: 'user',
            title: 'Assigned To',
            isMultiple: true,
            limitResults: 5,
            itemLimit: 5,
            getPersonas: (searchTerm, limitResults, options) => { return this._service.getUsers(searchTerm, limitResults, options); }
        },
        {
            key: 'status',
            name: 'TaskStatus',
            type: 'choice', //'choice2'
            title: 'Status',
            isMultiple: true,
            choices: [
                { value: "Not Started", key: 1 },
                { value: "In Progress", key: 2 },
                { value: "Completed", key: 3 }
                /*"Not Started",
                "In Progress",
                "Completed"*/
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
        }
        ];
    }

    _onChangeStartDate(startDate) {
        if (startDate) {
            let endField = this.getSearchField('DueDate');
            if (endField && endField.getFormField()) {
                let endDate = endField.getFormField().getControl().getDate();
                if (endDate && endDate < startDate) {
                    endField.getFormField().setFieldValue(startDate);
                }
            }
        }
    }

    _onChangeEndDate(endDate) {
        if (endDate) {
            let startField = this.getSearchField('StartDate');
            if (startField && startField.getFormField()) {
                let startDate = startField.getFormField().getControl().getDate() || endDate;
                if (startDate && endDate < startDate) {
                    startField.getFormField().setFieldValue(endDate);
                }
            }
        }
    }   

    _renderProjectListView = (ref, isMultiple, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) => {
        return <ProjectList ref={ref} service={this._service} pageSize={10} isMultipleSelection={isMultiple} commandItems={commandItems} emptyMessage="There are no projects." onSelect={onSelect} onItemSaving={onSaving} onItemDeleting={onDeleting} />;
    }

}

export default TaskSearchForm;