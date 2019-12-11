import React from "react";

import { SearchFormPanel } from './SearchFormPanel';
import { ProjectSearchForm } from './ProjectSearchForm';

export class ProjectSearchFormPanel extends SearchFormPanel {

    constructor(props) {
        super(props);
    }

    _renderSearchForm = (ref, service, onValidate) => {
        return (<ProjectSearchForm ref={ref} service={service} onValidate={onValidate} />);
    }
}

export default ProjectSearchFormPanel;