//import * as React from 'react';
import { ListForm } from './ListForm';

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
        return [{
            key: 'title',
            name: 'Title',
            type: 'text',
            title: 'Title',
            required: true
        },
        ];
    }
}

export default EmployeeForm;