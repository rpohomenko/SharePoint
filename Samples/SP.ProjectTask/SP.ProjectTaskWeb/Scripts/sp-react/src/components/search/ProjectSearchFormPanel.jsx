import React from "react";

import { SearchFormPanel } from './SearchFormPanel';
import { ProjectSearchForm } from './ProjectSearchForm';

export class ProjectSearchFormPanel extends SearchFormPanel {

    constructor(props) {
        super(props);
    }

    _renderSearchForm = (ref, service, fields, onValidate) => {
        return (<ProjectSearchForm ref={ref} service={service} fields={fields} onValidate={onValidate} />);
    }
}

export default ProjectSearchFormPanel;