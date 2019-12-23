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
            return <FormField ref={ref => this._formField = ref} disabled={(selectedComparison === 8 || selectedComparison === 9)} mode={2} fieldProps={fieldProps} onValidate={onValidate}
                onRenderField={(renderField) => this._onRenderField(renderField, selectedComparison, fieldProps.isAdvanced, fieldProps.type)} />;
        }
        return null;
    }

    _onRenderField(renderField, comparisonKey, isAdvanced, type) {
        if (isAdvanced) {
            const { fieldProps } = this.props;
            const availableComparisons = this._getAvailableComparisons(type);
            let comparison = availableComparisons[0];
            if (!isNaN(comparisonKey)) {
                comparison = availableComparisons[comparisonKey];
            }
            const options = availableComparisons.map((option) => {
                return { key: option.key, label: option.text, text: `${option.text} ${option.label}` }
            });
            return (<Stack horizontal styles={{ root: { padding: 2 } }}>
                <Dropdown
                    className="filter-type"
                    ref={ref => this._choiceField = ref}
                    placeholder={"Select a filter..."}

                    title={comparison ? comparison.label : undefined}
                    selectedKey={comparisonKey}
                    onRenderTitle={(items) => {
                        if (isArray(items)) {
                            return items.map(i => i.label).join(', ');
                        }
                    }}
                    dropdownWidth={200}
                    //styles={{ dropdown: { width: 300 } }}
                    onChange={(ev, item) => {
                        if (item) {
                            let selectedComparison = item.key;
                            this.setState({ selectedComparison: selectedComparison }, () => {
                                if (this.getFormField()) {
                                    //this.getFormField().getControl().validate(false);
                                    //this.getFormField().setFieldValue(fieldProps.isMultiple ? [] : null);
                                    /*if((selectedComparison === 8 || selectedComparison === 9)){
                                       this.getFormField().setFieldValue(fieldProps.isMultiple ? [] : null);
                                    }
                                    else{
                                        this.getFormField().getControl().validate(false);
                                    }*/
                                }
                            });
                        }
                    }}
                    options={options}
                />
                <div style={{ width: '100%' }}>{renderField()}</div>
            </Stack>);
        }
        return renderField();
    }

    getFormField() {
        return this._formField;
    }

    _getAvailableComparisons(fieldType) {
        const { fieldProps } = this.props;
        let availableComparisons = [];
        switch (fieldType) {
            case "text":
            case "search":
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
            let props = {
                ...fieldProps,
                filterComparison: comparison ? comparison.key : null,
                value: this.getFormField().getFieldValue(),

            };
            return props;
        }
        return null;
    }

    getFilterExpr() {
        const { fieldProps } = this.props;
        const { selectedComparison } = this.state;
        let expr = null;
        if (fieldProps && this.getFormField()) {
            let comparison = isNaN(selectedComparison)
                ? this._getComparison(fieldProps.filterComparison, fieldProps.type)
                : this._getComparison(selectedComparison, fieldProps.type);
            if (comparison) {
                let value = this.getFormField().getFieldValue();
                if (value && !(comparison.key === 8 || comparison.key === 9)) {
                    if(!isArray(value)){
                      value = value.replaceAll('"',"&quot;");
                    }
                    switch (fieldProps.type) {
                        case "text":
                        case "search":
                            switch (comparison.key) {
                                case 0:
                                    expr = `${fieldProps.name} == "${value}"`; break;
                                case 1:
                                    expr = `${fieldProps.name} != "${value}"`; break;
                                case 2:
                                    expr = `${fieldProps.name}.StartsWith("${value}")`; break;
                                case 3:
                                    expr = `${fieldProps.name}.Contains("${value}")`; break;
                            }
                            break;
                        case "choice":
                            switch (comparison.key) {
                                case 0:
                                    if (fieldProps.isMultiple && isArray(value)) {
                                        expr = value.map(choice => (`${fieldProps.name} == ${choice}`)).join(' || ');
                                        if (value.length > 1) {
                                            expr = `(${expr})`;
                                        }
                                    }
                                    else {
                                        expr = `${fieldProps.name} == ${value}`;
                                    }
                                    break;
                                case 1:
                                    if (fieldProps.isMultiple && isArray(value)) {
                                        expr = value.map(choice => (`${fieldProps.name} != ${choice}`)).join(' && ');
                                        if (value.length > 1) {
                                            expr = `(${expr})`;
                                        }
                                    }
                                    else {
                                        expr = `${fieldProps.name} != ${value}`;
                                    }
                                    break;
                            }
                            break;
                        case "choice2":
                            switch (comparison.key) {
                                case 0:
                                    if (fieldProps.isMultiple && isArray(value)) {
                                        if (value.length > 0) {
                                            expr = value.map(choice => (`${fieldProps.name} == ${choice}`)).join(' || ');
                                            if (value.length > 1) {
                                                expr = `(${expr})`;
                                            }
                                        }
                                    }
                                    expr = `${fieldProps.name} == "${value}"`;
                                    break;
                                case 1:
                                    if (fieldProps.isMultiple && isArray(value)) {
                                        expr = value.map(choice => (`${fieldProps.name} != ${choice}`)).join(' && ');
                                        if (value.length > 1) {
                                            expr = `(${expr})`;
                                        }
                                    }
                                    else {
                                        expr = `${fieldProps.name} != "${value}"`;
                                    }
                                    break;
                            }
                            break;
                        case "lookup":
                            switch (comparison.key) {
                                case 0:
                                    if (fieldProps.isMultiple && isArray(value)) {
                                        if (value.length > 0) {
                                            var lookupIds = value.map(lookup => lookup.Id);
                                            if (!!fieldProps.notLookupInclude) {
                                                expr = `Extensions.Includes(${fieldProps.name}, new[] { ${lookupIds.join(',')} })`;
                                            }
                                            else {
                                                expr = lookupIds.map(lookupId => (`Extensions.LookupIdIncludes(${fieldProps.name}, ${lookupId})`)).join(' || ');
                                                if (lookupIds.length > 1) {
                                                    expr = `(${expr})`;
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        // expr = `${fieldProps.name}==${value.Id}`;
                                        expr = `Extensions.Equals(${fieldProps.name}, ${value.Id})`;
                                    }
                                    break;
                                case 1:
                                    if (fieldProps.isMultiple && isArray(value)) {
                                        if (value.length > 0) {
                                            var lookupIds = value.map(lookup => lookup.Id);
                                            if (!!fieldProps.notLookupInclude) {
                                                //expr = lookupIds.map(lookupId => (`${fieldProps.name} != ${lookupId}`)).join(' && ');
                                                //expr = lookupIds.map(lookupId => (`Extensions.NotEquals(${fieldProps.name}, ${lookupId})`)).join(' && ');
                                                expr = lookupIds.map(lookupId => (`Extensions.NotEquals(${fieldProps.name}, ${lookupId})`)).join(' && ');
                                            }
                                            else {
                                                expr = lookupIds.map(lookupId => (`Extensions.LookupIdNotIncludes(${fieldProps.name}, ${lookupId})`)).join(' && ');
                                            }
                                            if (lookupIds.length > 1) {
                                                expr = `(${expr})`;
                                            }
                                        }
                                    }
                                    else {
                                        //expr = `${fieldProps.name} != ${value.Id}`;
                                        expr = `Extensions.NotEquals(${fieldProps.name}, ${value.Id})`;
                                    }
                                    break;
                            }
                            break;
                        case "user":
                            switch (comparison.key) {
                                case 0:
                                    if (fieldProps.isMultiple && isArray(value)) {
                                        if (value.length > 0) {
                                            var userIds = value.map(user => user.Id);
                                            if (!!fieldProps.notLookupInclude) {
                                                expr = `Extensions.Includes(${fieldProps.name}, new[] { ${userIds.join(',')} })`;
                                            }
                                            else {
                                                expr = userIds.map(userId => (`Extensions.LookupIdIncludes(${fieldProps.name}, ${userId})`)).join(' || ');
                                                if (userIds.length > 1) {
                                                    expr = `(${expr})`;
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        expr = `${fieldProps.name}==${value.Id}`;
                                    }
                                    break;
                                case 1:
                                    if (fieldProps.isMultiple && isArray(value)) {
                                        if (value.length > 0) {
                                            var userIds = value.map(user => user.Id);
                                            if (!!fieldProps.notLookupInclude) {
                                                //expr = userIds.map(userId => (`${fieldProps.name} != ${userId}`)).join(' && ');
                                                expr = userIds.map(userId => (`Extensions.NotEquals(${fieldProps.name}, ${userId})`)).join(' && ');
                                            }
                                            else {
                                                expr = userIds.map(userId => (`Extensions.LookupIdNotIncludes(${fieldProps.name}, ${userId})`)).join(' && ');
                                            }
                                            if (userIds.length > 1) {
                                                expr = `(${expr})`;
                                            }
                                        }
                                    }
                                    else {
                                        expr = `${fieldProps.name}!=${value.Id}`;
                                    }
                                    break;
                            }
                            break;
                        case "date":
                        case "datetime":
                            switch (comparison.key) {
                                case 0:
                                    expr = `${fieldProps.name} == "${value}"`; break;
                                case 1:
                                    expr = `${fieldProps.name} != "${value}"`; break;
                                case 4:
                                    expr = `${fieldProps.name} < "${value}"`; break;
                                case 5:
                                    expr = `${fieldProps.name} <= "${value}"`; break;
                                case 6:
                                    expr = `${fieldProps.name} > "${value}"`; break;
                                case 7:
                                    expr = `${fieldProps.name} >= "${value}"`; break;
                            }
                            break;
                        case "number":
                            switch (comparison.key) {
                                case 0:
                                    expr = `${fieldProps.name} == ${value}`; break;
                                case 1:
                                    expr = `${fieldProps.name} != ${value}`; break;
                                case 4:
                                    expr = `${fieldProps.name} < ${value}`; break;
                                case 5:
                                    expr = `${fieldProps.name} <= ${value}`; break;
                                case 6:
                                    expr = `${fieldProps.name} > ${value}`; break;
                                case 7:
                                    expr = `${fieldProps.name} >= ${value}`; break;
                            }
                            break;
                    }
                }
                else {
                    switch (comparison.key) {
                        case 8:
                            expr = `${fieldProps.name} == null`; break;
                        case 9:
                            expr = `${fieldProps.name} != null`; break;
                    }
                }
            }
        }      
        return expr;
    }
}

export default SearchField;