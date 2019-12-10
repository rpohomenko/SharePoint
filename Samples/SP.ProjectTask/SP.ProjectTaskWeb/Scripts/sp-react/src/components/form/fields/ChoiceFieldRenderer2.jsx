import * as React from 'react';
import { ChoiceFieldRenderer } from './ChoiceFieldRenderer';
import { isArray } from 'util';

export class ChoiceFieldRenderer2 extends ChoiceFieldRenderer {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state
        };
    }

    componentDidMount() {
        super.componentDidMount();
        let props = this.props;
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
        this.setState({
            currentValue: currentValue,
            value: currentValue,
            options: options
        });
    }

    _renderNewForm() {
        return super._renderNewForm();
    }

    _renderEditForm() {
        return super._renderEditForm();
    }

    _renderDispForm() {
        const { currentValue } = this.props;
        if (isArray(currentValue)) {
            return currentValue.map((choice, i) => (<span key={`choice_${i}`}>{i > 0 ? ', ' : ''}{choice}</span>));
        }
        return (<span>{currentValue ? currentValue : ''}</span>);
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
}

export default ChoiceFieldRenderer2;