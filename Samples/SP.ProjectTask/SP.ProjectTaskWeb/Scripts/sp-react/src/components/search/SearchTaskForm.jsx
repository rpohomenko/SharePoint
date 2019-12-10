import * as React from 'react';
import PropTypes from 'prop-types';

import { SearchForm } from './SearchForm';
import { ProjectList } from '../lists/Projects';
import { ProjectFormPanel } from '../form/ProjectFormPanel';

export class SearchTaskForm extends SearchForm {
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
            name: 'ProjectId',
            type: 'lookup',
            title: 'Project',
            lookupList: 'Projects',
            lookupField: 'Title',
            isMultiple: false,           
            renderListView: (ref, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted) =>
                this._renderProjectListView(ref, false, commandItems, onSelect, onSaving, onDeleting, onSaved, onDeleted),
            renderListForm: (ref) => this._renderProjectListForm(ref),
            getItems: (searchTerm, limitResults, options) => { return this._service.getProjects(limitResults, null, "Title", false, `Title.Contains("${searchTerm}")`, ['Id', 'Title'], options); }
        },
        {
            key: 'assignedTo',
            name: 'AssignedTo',
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

}

export default SearchTaskForm;