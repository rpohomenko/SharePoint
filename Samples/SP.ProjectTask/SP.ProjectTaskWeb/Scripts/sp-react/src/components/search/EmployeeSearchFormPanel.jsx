import React from "react";

import { SearchFormPanel } from './SearchFormPanel';
import { EmployeeSearchForm } from './EmployeeSearchForm';

export class EmployeeSearchFormPanel extends SearchFormPanel {

    constructor(props) {
        super(props);
    }

    _renderSearchForm = (ref, service, onValidate) => {
        return (<EmployeeSearchForm ref={ref} service={service} onValidate={onValidate} />);
    }
}

export default EmployeeSearchFormPanel;