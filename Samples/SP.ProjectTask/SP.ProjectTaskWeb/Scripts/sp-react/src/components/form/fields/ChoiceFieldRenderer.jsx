import * as React from 'react';
import { Dropdown, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { isArray } from 'util';

export class ChoiceFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);

        let currentValue = props.currentValue;
        let fieldProps = props.fieldProps;
        let choices = fieldProps.choices;
        let options = [];
        if (isArray(choices)) {
            currentValue = isArray(currentValue)
                ? currentValue.map((val, i) => choices.indexOf(val))
                : (currentValue ? choices.indexOf(currentValue) : null);

            if (isArray(choices)) {
                options = fieldProps.choices.map((choice, i) => { return { key: i, text: choice } });
                if (!fieldProps.required && !fieldProps.isMultiple) {
                    options = [{ key: -1, text: '' }].concat(options);
                }
            }
        }
        this.state = {
            ...this.state,
            currentValue: currentValue,
            value: currentValue,
            options: options
        };
    }

    _renderNewForm() {
        return this._renderNewOrEditForm();
    }

    _renderEditForm() {
        return this._renderNewOrEditForm();
    }

    _renderDispForm() {
        const { currentValue } = this.props;
        if (isArray(currentValue)) {
            return currentValue.map((choice, i) => (<span key={`choice_${i}`}>{i > 0 ? ', ' : ''}{choice}</span>));
        }
        return (<span>{currentValue ? currentValue : ''}</span>);
    }

    _renderNewOrEditForm() {
        const { fieldProps, disabled } = this.props;
        const { value, options } = this.state;

        let selectedKeys = (isArray(value) ? value : null);
        return (fieldProps.isMultiple
            ? <Dropdown
                placeholder={fieldProps.placeholder}
                selectedKeys={selectedKeys}
                onChange={(ev, item) => this._onChange(item)}
                multiSelect
                options={options}
                disabled={disabled}
                styles={{ dropdown: { width: '100%' } }}
            />
            : <Dropdown
                placeholder={fieldProps.placeholder}
                selectedKey={value}
                onChange={(ev, item) => this._onChange(item)}
                options={options}
                disabled={disabled}
                styles={{ dropdown: { width: '100%' } }}
            />
        );
    }

    _onChange = (item) => {
        if (this.props.fieldProps.isMultiple) {
            const newSelectedKeys = [...this.state.value || []];
            if (item.selected) {
                // add the option if it's checked
                newSelectedKeys.push(item.key);
            } else {
                // remove the option if it's unchecked
                const currIndex = newSelectedKeys.indexOf(item.key);
                if (currIndex > -1) {
                    newSelectedKeys.splice(currIndex, 1);
                }
            }
            this.setValue(newSelectedKeys);
        }
        else {
            this.setValue(item.key);
        }
    }

    _validate = () => {
        let { isValid, validationErrors } = {};
        isValid = true;
        return { isValid: isValid, validationErrors: validationErrors };
    }

    getValue() {
        const { fieldProps } = this.props;
        let value = super.getValue();
        if (isArray(fieldProps.choices)) {
            if (fieldProps.isMultiple) {
                if ((isArray(value) && value.length > 0))
                    return value.map((key) => fieldProps.choices[key]);
            }
            else {
                return fieldProps.choices[value];
            }
        }
        return null;
    }

    hasValue() {
        return super.hasValue() && (isArray(this.getValue()) && this.getValue().length > 0);
    }

    isDirty() {
        const { fieldProps } = this.props;
        const { value, currentValue } = this.state;
        if (super.isDirty()) {
            if (fieldProps.isMultiple) {
                if (isArray(value) && isArray(currentValue)) {
                    if (value.length !== currentValue.length) return true;
                    let arr1 = value.sort((a, b) => a - b);
                    let arr2 = currentValue.sort((a, b) => a - b);
                    for (var i = 0; i < arr1.length; i++) {
                        if (arr1[i] !== arr2[i]) return true;
                    }
                    return false;
                }
            }
            if(value === -1){
                return currentValue !== -1 && currentValue !== null && currentValue !== undefined;
            }
            return value !== currentValue;
        }
        return false;
    }
}

export default ChoiceFieldRenderer;