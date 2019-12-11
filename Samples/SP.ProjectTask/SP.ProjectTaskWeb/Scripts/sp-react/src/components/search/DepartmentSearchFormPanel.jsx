import React from "react";

import { SearchFormPanel } from './SearchFormPanel';
import { DepartmentSearchForm } from './DepartmentSearchForm';

export class DepartmentSearchFormPanel extends SearchFormPanel {

    constructor(props) {
        super(props);
    }

    _renderSearchForm = (ref, service, onValidate) => {
        return (<DepartmentSearchForm ref={ref} service={service} onValidate={onValidate} />);
    }
}

export default DepartmentSearchFormPanel;