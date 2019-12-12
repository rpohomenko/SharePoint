import * as React from 'react';

import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';

import { FormField } from '../form/fields/FormField';
import { isArray } from 'util';

export class SearchField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ...this.props
        };

        this._filterComparisons = [
            { key: 0, label: "Equal to", text: "=" },
            { key: 1, label: "Not equal to", text: "≠" },
            { key: 2, label: "Starts with", text: "^" },
            { key: 3, label: "Contains", text: "~" },
            { key: 4, label: "Less than", text: "<" },
            { key: 5, label: "Less than or equal to", text: "≤" },
            { key: 6, label: "Greater than", text: ">" },
            { key: 7, label: "Greater than or equal to", text: "≥" },
            { key: 8, label: "Empty", text: "∅" },
            { key: 9, label: "Not empty", text: "≠∅" }
        ]
    }

    render() {
        const { fieldProps, onValidate } = this.props;
        let { selectedComparison } = this.state;
        if (fieldProps) {
            if (isNaN(selectedComparison)) {
                let comparison = this._getComparison(fieldProps.filterComparison, fieldProps.type);
                if (comparison) {
                    selectedComparison = comparison.key;
                }
            }
            return <FormField ref={ref => this._formField = ref} disabled={(selectedComparison === 8 || selectedComparison === 9)} mode={1} fieldProps={fieldProps} onValidate={onValidate}
                onRenderField={(renderField) => this._onRenderField(renderField, selectedComparison, fieldProps.isAdvanced, fieldProps.type)} />;
        }
        return null;
    }

    _onRenderField(renderField, selectedComparison, isAdvanced, type) {
        if (isAdvanced) {
            const options = this._getAvailableComparisons(type);
            return (<Stack horizontal styles={{ root: { padding: 2 } }}>
                <Dropdown
                    ref={ref => this._choiceField = ref}
                    placeholder={"Select a filter..."}
                    selectedKey={selectedComparison}
                    onChange={(ev, item) => {
                        if (item) {
                            this.setState({ selectedComparison: item.key }, ()=>{
                                if(this.getFormField()){
                                    this.getFormField().setFieldValue(null);
                                }
                            });
                        }
                    }}
                    options={options}
                />
                <div style={{width: '100%'}}>{renderField()}</div>
            </Stack>);
        }
        return renderField();
    }

    getFormField() {
        return this._formField;
    }

    _getAvailableComparisons(fieldType) {
        let availableComparisons = [];
        switch (fieldType) {
            case "text":
                availableComparisons.push(this._filterComparisons[0]);
                availableComparisons.push(this._filterComparisons[1]);
                availableComparisons.push(this._filterComparisons[2]);
                availableComparisons.push(this._filterComparisons[3]);
                availableComparisons.push(this._filterComparisons[8]);
                availableComparisons.push(this._filterComparisons[9]);
                break;
            case "date":
            case "datetime":
            case "number":
                availableComparisons.push(this._filterComparisons[0]);
                availableComparisons.push(this._filterComparisons[1]);
                availableComparisons.push(this._filterComparisons[4]);
                availableComparisons.push(this._filterComparisons[5]);
                availableComparisons.push(this._filterComparisons[6]);
                availableComparisons.push(this._filterComparisons[7]);
                availableComparisons.push(this._filterComparisons[8]);
                availableComparisons.push(this._filterComparisons[9]);
                break;
            case "choice":
            case "choice2":
                availableComparisons.push(this._filterComparisons[0]);
                availableComparisons.push(this._filterComparisons[1]);
                availableComparisons.push(this._filterComparisons[8]);
                availableComparisons.push(this._filterComparisons[9]);
                break;
            case "lookup":
            case "user":
                availableComparisons.push(this._filterComparisons[0]);
                availableComparisons.push(this._filterComparisons[1]);
                availableComparisons.push(this._filterComparisons[8]);
                availableComparisons.push(this._filterComparisons[9]);
                break;
            default:
                availableComparisons.push(this._filterComparisons[0]);
                availableComparisons.push(this._filterComparisons[1]);
                availableComparisons.push(this._filterComparisons[8]);
                availableComparisons.push(this._filterComparisons[9]);
                break;
        }
        return availableComparisons;
    }

    _getComparison = (defaultComparison, fieldType) => {
        let filterComparison;
        if (!isNaN(defaultComparison) && defaultComparison >= 0 && defaultComparison < this._filterComparisons.length) {
            filterComparison = this._filterComparisons[defaultComparison];
        }

        let defaultFilterComparison = this._filterComparisons[0];
        switch (fieldType) {
            case "text":
                defaultFilterComparison = this._filterComparisons[3];
                break;
        }

        if (filterComparison) {
            if (this._getAvailableComparisons(fieldType).indexOf(filterComparison) === -1) {
                filterComparison = defaultFilterComparison;
            }
        }
        else {
            filterComparison = defaultFilterComparison;
        }

        return filterComparison;
    }

    getComparison() {
        const { selectedComparison } = this.state;
        return selectedComparison;
    }

    getFieldProps() {
        const { fieldProps } = this.props;
        const { selectedComparison } = this.state;
        if (fieldProps && this.getFormField()) {
            let comparison = isNaN(selectedComparison)
                ? this._getComparison(fieldProps.filterComparison, fieldProps.type)
                : this._getComparison(selectedComparison, fieldProps.type);
            if (comparison) {
                fieldProps.filterComparison = comparison.key;
                fieldProps.value = this.getFormField().getFieldValue();
                return fieldProps;
            }
        }
        return null;
    }

    getFilterExpr() {
        const { fieldProps } = this.props;
        const { selectedComparison } = this.state;
        if (fieldProps && this.getFormField()) {
            let comparison = isNaN(selectedComparison)
                ? this._getComparison(fieldProps.filterComparison, fieldProps.type)
                : this._getComparison(selectedComparison, fieldProps.type);
            if (comparison) {
                let value = this.getFormField().getFieldValue();
                if (value) {
                    switch (fieldProps.type) {
                        case "text":
                            switch (comparison.key) {
                                case 0:
                                    return `${fieldProps.name} == "${value}"`;
                                case 1:
                                    return `${fieldProps.name} != "${value}"`;
                                case 2:
                                    return `${fieldProps.name}.StartsWith("${value}")`;
                                case 3:
                                    return `${fieldProps.name}.Contains("${value}")`;
                            }
                        case "choice":
                            switch (comparison.key) {
                                case 0:
                                    if (fieldProps.isMultiple) {
                                        if (isArray(value)) {
                                            return value.map(choice => (`${fieldProps.name} == ${choice}`)).join(' || ');
                                        }
                                    }
                                    return `${fieldProps.name} == ${value}`;
                                case 1:
                                    if (fieldProps.isMultiple) {
                                        if (isArray(value)) {
                                            return value.map(choice => (`${fieldProps.name} != ${choice}`)).join(' && ');
                                        }
                                    }
                                    return `${fieldProps.name} != ${value}`;
                            }

                        case "choice2":
                            switch (comparison.key) {
                                case 0:
                                    if (fieldProps.isMultiple) {
                                        if (isArray(value)) {
                                            return value.map(choice => (`${fieldProps.name} == ${choice}`)).join(' || ');
                                        }
                                    }
                                    return `${fieldProps.name} == "${value}"`;
                                case 1:
                                    if (fieldProps.isMultiple) {
                                        if (isArray(value)) {
                                            return value.map(choice => (`${fieldProps.name} != ${choice}`)).join(' && ');
                                        }
                                    }
                                    return `${fieldProps.name} != "${value}"`;
                            }
                        case "lookup": {
                            switch (comparison.key) {
                                case 0:
                                    if (fieldProps.isMultiple) {
                                        if (isArray(value)) {
                                            var lookupIds = value.map(lookup => lookup.Id);
                                            if (!!fieldProps.notLookupInclude) {
                                                return `Extensions.Includes(${fieldProps.name}, new[] { ${lookupIds.join(',')} })`;
                                            }
                                            return lookupIds.map(lookupId => (`Extensions.LookupIdIncludes(${fieldProps.name}, ${lookupId})`)).join(' || ');
                                        }
                                    }
                                    return `${fieldProps.name}==${value.Id}`;
                                case 1:
                                    if (fieldProps.isMultiple) {
                                        if (isArray(value)) {
                                            var lookupIds = value.map(lookup => lookup.Id);
                                            if (!!fieldProps.notLookupInclude) {
                                                return lookupIds.map(lookupId => (`${fieldProps.name} != ${lookupId}`)).join(' && ');
                                            }
                                            return lookupIds.map(lookupId => (`Extensions.LookupIdNotIncludes(${fieldProps.name}, ${lookupId})`)).join(' && ');
                                        }
                                    }
                                    return `${fieldProps.name}!=${value.Id}`;
                            }
                        }
                        case "user": {
                            switch (comparison.key) {
                                case 0:
                                    if (fieldProps.isMultiple) {
                                        if (isArray(value)) {
                                            var userIds = value.map(user => user.Id);
                                            if (!!fieldProps.notLookupInclude) {
                                                return `Extensions.Includes(${fieldProps.name}, new[] { ${userIds.join(',')} })`;
                                            }
                                            return userIds.map(userId => (`Extensions.LookupIdIncludes(${fieldProps.name}, ${userId})`)).join(' || ');
                                        }
                                    }
                                    return `${fieldProps.name}==${value.Id}`;
                                case 1:
                                    if (fieldProps.isMultiple) {
                                        if (isArray(value)) {
                                            var userIds = value.map(user => user.Id);
                                            if (!!fieldProps.notLookupInclude) {
                                                return userIds.map(userId => (`${fieldProps.name} != ${userId}`)).join(' && ');
                                            }
                                            return userIds.map(userId => (`Extensions.LookupIdNotIncludes(${fieldProps.name}, ${userId})`)).join(' && ');
                                        }
                                    }
                                    return `${fieldProps.name}!=${value.Id}`;
                            }
                        }
                        case "date":
                        case "datetime":
                            switch (comparison.key) {
                                case 0:
                                    return `${fieldProps.name} == "${value}"`;
                                case 1:
                                    return `${fieldProps.name} != "${value}"`;
                                case 4:
                                    return `${fieldProps.name} < "${value}"`;
                                case 5:
                                    return `${fieldProps.name} <= "${value}"`;
                                case 6:
                                    return `${fieldProps.name} > "${value}"`;
                                case 7:
                                    return `${fieldProps.name} >= "${value}"`;
                            }
                        case "number":
                            switch (comparison.key) {
                                case 0:
                                    return `${fieldProps.name} == ${value}`;
                                case 1:
                                    return `${fieldProps.name} != ${value}`;
                                case 4:
                                    return `${fieldProps.name} < ${value}`;
                                case 5:
                                    return `${fieldProps.name} <= ${value}`;
                                case 6:
                                    return `${fieldProps.name} > ${value}`;
                                case 7:
                                    return `${fieldProps.name} >= ${value}`;
                            }
                    }
                }
                else {
                    switch (comparison.key) {
                        case 8:
                            return `${fieldProps.name} == null`;
                        case 9:
                            return `${fieldProps.name} != null`;
                    }
                }
            }
        }
    }
}

export default SearchField;