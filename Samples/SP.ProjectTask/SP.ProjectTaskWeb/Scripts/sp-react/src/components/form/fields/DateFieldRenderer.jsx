import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { DatePicker, DayOfWeek } from 'office-ui-fabric-react/lib/DatePicker';
import { BaseFieldRenderer } from './BaseFieldRenderer';
var moment = require('moment');

export class DateFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);
        let currentValue = props.currentValue;
        if(currentValue){
            currentValue = new Date(currentValue);
        }
        this.state = {
            ...this.state,
            currentValue: currentValue,
            value: currentValue           
        };       
    }

    _renderNewForm() {
        return this._renderNewOrEditForm();
    }

    _renderEditForm() {
        return this._renderNewOrEditForm();
    }

    _renderDispForm() {
        return (<Label>{this.props.currentValue}</Label>);
    }

    _renderNewOrEditForm() {
        const { fieldProps, currentValue, disabled } = this.props;
        const { item, value } = this.state;
        let firstDayOfWeek = fieldProps.dateOptions ? fieldProps.dateOptions.firstDayOfWeek : 0;
        return (
            <DatePicker
                ref={ref => this._date = ref}
                disabled={disabled}
                allowTextInput={true}
                firstDayOfWeek={firstDayOfWeek}
                strings={fieldProps.dateOptions}
                value={value}
                onSelectDate={(date) => this._onChange(date)}
                formatDate={(date)=>this._onFormatDate(date)}
                parseDateFromString={this._onParseDateFromString}
            />
        );
    }

    _onChange = (date) => {
        this.setValue(date);
    }

    _onFormatDate = (date) => {
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + (date.getFullYear() % 100);
    };

    _onParseDateFromString = (value) => {
        const date = this.state.value || new Date();
        const values = (value || '').trim().split('/');
        const day = values.length > 0 ? Math.max(1, Math.min(31, parseInt(values[0], 10))) : date.getDate();
        const month = values.length > 1 ? Math.max(1, Math.min(12, parseInt(values[1], 10))) - 1 : date.getMonth();
        let year = values.length > 2 ? parseInt(values[2], 10) : date.getFullYear();
        if (year < 100) {
            year += date.getFullYear() - (date.getFullYear() % 100);
        }
        return new Date(year, month, day);
    };

    _validate = () => {
        let { isValid, validationErrors } = {};
        isValid = true;
        return { isValid: isValid, validationErrors: validationErrors };
    }

    getValue(){
        let date = super.getValue();
        if(date){
            return moment(date).format("YYYY-DD-MM[T]HH:mm:ss"); //date.toJSON(); //date.toISOString();
        }
        return null;
    }

    hasValue() {
        return this.getValue() !== "" && super.hasValue();
    }
}

export default DateFieldRenderer;