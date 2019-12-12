import React from "react";

import { SearchFormPanel } from './SearchFormPanel';
import { TaskSearchForm } from './TaskSearchForm';

export class TaskSearchFormPanel extends SearchFormPanel {

    constructor(props) {
        super(props);
    }

    _renderSearchForm = (ref, service, fields, onValidate) => {
        return (<TaskSearchForm ref={ref} service={service} fields={fields} onValidate={onValidate} />);
    }
}

export default TaskSearchFormPanel;