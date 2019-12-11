import * as React from 'react';
import PropTypes from 'prop-types';

import { SearchForm } from './SearchForm';

export class DepartmentSearchForm extends SearchForm {
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
            key: 'shortName',
            name: 'ShortName',
            type: 'text',
            title: 'Short Name'           
        }
        ];
    }
}

export default DepartmentSearchForm;