import * as React from 'react';

import { FormField } from '../form/fields/FormField';

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
                        return `${fieldProps.name}==${value}`;
                        /*value = fieldProps.choices.filter(choice => choice.key === value);
                        if (value.length > 0) {
                            value = value[0].value;
                            return `${fieldProps.name}=="${value}"`;
                        }*/
                    case "choice2":
                        return `${fieldProps.name}=="${value}"`;
                    case "lookup":{
                        return `${fieldProps.name}==${value.Id}`;
                    }
                    case "user":{
                        var userIds = value.map(user => user.Id);
                        return userIds.map(userId => (`it.LookupIdIncludes(it.${fieldProps.name},${userId})`)).join(' && ');
                    }
                }
            }
        }
    }
}

export default SearchField;