import * as React from 'react';

import { FormField } from '../form/fields/FormField';
import { isArray } from 'util';

export class SearchField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ...this.props
        };
    }

    componentDidMount() {

    }

    render() {
        const { fieldProps, onValidate } = this.props;
        return <FormField ref={ref => this._formField = ref} mode={1} fieldProps={fieldProps} onValidate={onValidate} />;
    }

    getFormField() {
        return this._formField;
    }

    getFilter() {
        const { fieldProps } = this.props;
        if (fieldProps && this.getFormField()) {
            let value = this.getFormField().getFieldValue();
            if (value) {
                switch (fieldProps.type) {
                    case "text":
                        return `${fieldProps.name}.Contains("${value}")`;
                    case "choice":
                        if (fieldProps.isMultiple) {
                            if (isArray(value)) {
                                return value.map(choice => (`${fieldProps.name}==${choice}`)).join(/*' && '*/' || ');
                            }
                        }
                        return `${fieldProps.name}==${value}`;
                    /*value = fieldProps.choices.filter(choice => choice.key === value);
                    if (value.length > 0) {
                        value = value[0].value;
                        return `${fieldProps.name}=="${value}"`;
                    }*/
                    case "choice2":
                            if (fieldProps.isMultiple) {
                                if (isArray(value)) {
                                    return value.map(choice => (`${fieldProps.name}==${choice}`)).join(/*' && '*/' || ');
                                }
                            }
                        return `${fieldProps.name}=="${value}"`;
                    case "lookup": {
                        if (fieldProps.isMultiple) {
                            if (isArray(value)) {
                                var lookupIds = value.map(lookup => lookup.Id);
                                if (!!fieldProps.notLookupInclude) {
                                    return `Extensions.Includes(${fieldProps.name},new[]{${lookupIds.join(',')}})`;
                                }
                                return lookupIds.map(lookupId => (`Extensions.LookupIdIncludes(${fieldProps.name},${lookupId})`)).join(/*' && '*/' || ');
                            }
                        }
                        return `${fieldProps.name}==${value.Id}`;
                    }
                    case "user": {
                        if (fieldProps.isMultiple) {
                            if (isArray(value)) {
                                var userIds = value.map(user => user.Id);
                                if (!!fieldProps.notLookupInclude) {
                                    return `Extensions.Includes(${fieldProps.name},new[]{${userIds.join(',')}})`;
                                }
                                return userIds.map(userId => (`Extensions.LookupIdIncludes(${fieldProps.name},${userId})`)).join(/*' && '*/' || ');
                            }
                        }
                        return `${fieldProps.name}==${value.Id}`;
                    }
                    case "date":
                        return `${fieldProps.name}=="${value}"`;
                    case "datetime":
                        return `${fieldProps.name}=="${value}"`;
                }
            }
        }
    }
}

export default SearchField;