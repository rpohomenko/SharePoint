import React from "react";

import { SearchFormPanel } from './SearchFormPanel';
import { SearchTaskForm } from './SearchTaskForm';

export class SearchTaskFormPanel extends SearchFormPanel {

    constructor(props) {
        super(props);
    }

    _renderSearchForm = (ref, service, onValidate) => {
        return (<SearchTaskForm ref={ref} service={service} onValidate={onValidate} />);
    }
}

export default SearchTaskFormPanel;