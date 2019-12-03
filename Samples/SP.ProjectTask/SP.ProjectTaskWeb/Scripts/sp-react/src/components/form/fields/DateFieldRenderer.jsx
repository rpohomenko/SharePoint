import * as React from 'react';
import { DatePicker, DayOfWeek } from 'office-ui-fabric-react/lib/DatePicker';
import { BaseFieldRenderer } from './BaseFieldRenderer';
var moment = require('moment');

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

export class DateFieldRenderer extends BaseFieldRenderer {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            value: null
        };
    }

    componentDidMount(){
        super.componentDidMount();

        let props = this.props;
        let currentValue = props.currentValue;
        this._tzBias = 0;
        if (_spPageContextInfo && _spPageContextInfo.regionalSettings) {
            this._tzBias = _spPageContextInfo.regionalSettings.tzBias;
        }

        if (currentValue) {
            currentValue = this._getDate(currentValue, this._tzBias);
        }

        if (_currentCulture) {
            moment.updateLocale(_currentCulture.twoLetterISOLanguageName, {
                monthsShort: _currentCulture.abbreviatedMonthNames,
                months: _currentCulture.monthNames,
                weekdays: _currentCulture.dayNames,
                weekdaysShort: _currentCulture.abbreviatedDayNames,
                longDateFormat: {
                    //LT: _currentCulture.shortTimeFormat,
                    //LTS: _currentCulture.longTimeFormat,
                    L: _currentCulture.shortDateFormat.toUpperCase(),
                    LL: _currentCulture.longDateFormat.replaceAll('y', 'Y').replaceAll(/\bd\b/gi, 'D').replaceAll(/\bdd\b/gi, 'DD').replaceAll("'", ''),
                }
            });
            moment.locale(_currentCulture.twoLetterISOLanguageName);
        }

        var dateSettings = [...props.fieldProps.dateSettings || []];
        if (_currentCulture) {
            if (dateSettings.months === undefined) {
                dateSettings.months = _currentCulture.monthNames;
            }
            if (dateSettings.shortMonths === undefined) {
                dateSettings.shortMonths = _currentCulture.abbreviatedMonthNames;
            }
            if (dateSettings.days === undefined) {
                dateSettings.days = _currentCulture.dayNames;
            }
            if (dateSettings.shortDays === undefined) {
                dateSettings.shortDays = _currentCulture.abbreviatedDayNames;
            }
            if (dateSettings.firstDayOfWeek === undefined) {
                dateSettings.firstDayOfWeek = _currentCulture.firstDayOfWeek;
            }
        }

        this.setState({
            dateSettings: dateSettings,
            currentValue: currentValue,
            value: currentValue
        });
    }

    _getDate(dateString, tzBias) {
        let date = new Date(dateString);
        return this._getLocaleDate(date, tzBias);
    }

    _getLocaleDate(date, tzBias) {
        return moment(date).add(-(moment(date).utcOffset() + tzBias), 'm').toDate();
    }

    _getUtcDate(date, tzBias) {
        return moment(date).add(moment(date).utcOffset() + tzBias, 'm')/*.utc()*/.toDate();
    }

    _renderNewForm() {
        return this._renderNewOrEditForm();
    }

    _renderEditForm() {
        return this._renderNewOrEditForm();
    }

    _renderDispForm() {
        let date = this.state.currentValue;
        return date ? (<span>{this._onFormatDate(date, this.props.fieldProps.longDateFormat || "LL")}</span>) : null;
    }

    _renderNewOrEditForm() {
        const { fieldProps, currentValue, disabled } = this.props;
        const { item, value, dateSettings } = this.state;
        return (
            <DatePicker
                ref={ref => this._date = ref}
                disabled={disabled}
                allowTextInput={true}
                firstDayOfWeek={dateSettings ? dateSettings.firstDayOfWeek : 0}
                strings={dateSettings}
                value={value}
                onSelectDate={(date) => this._onDateChange(date)}
                formatDate={(date) => this._onFormatDate(date, fieldProps.shortDateFormat || "L")}
                parseDateFromString={(value) => this._onParseDateFromString(value, fieldProps.shortDateFormat || "L")}
            />
        );
    }

    _onDateChange(date) {
        this.setValue(date);
    }

    _onFormatDate = (date, format) => {
        return moment(date).format(format);
        //return date.getDate() + '/' + (date.getMonth() + 1) + '/' + (date.getFullYear() % 100);
    };

    _onParseDateFromString = (value, format) => {
        /*const date = this.state.value || new Date();
        const values = (value || '').trim().split('/');
        const day = values.length > 0 ? Math.max(1, Math.min(31, parseInt(values[0], 10))) : date.getDate();
        const month = values.length > 1 ? Math.max(1, Math.min(12, parseInt(values[1], 10))) - 1 : date.getMonth();
        let year = values.length > 2 ? parseInt(values[2], 10) : date.getFullYear();
        if (year < 100) {
            year += date.getFullYear() - (date.getFullYear() % 100);
        }
        return new Date(year, month, day);*/
        return moment(value, format).toDate();
    };

    _validate = () => {
        let { isValid, validationErrors } = {};
        isValid = true;
        return { isValid: isValid, validationErrors: validationErrors };
    }

    getValue() {
        let date = super.getValue();
        if (date) {
            date = this._getUtcDate(date, this._tzBias);
            return date.toISOString();
        }
        return null;
    }

    hasValue() {
        return this.getValue() !== null && super.hasValue();
    }

    isDirty() {
        const { value, currentValue } = this.state;
        if (super.isDirty()) {
            if (value !== currentValue) {
                if (value) {
                    if (currentValue) {
                        return currentValue - value !== 0;
                    }
                }
                else if (!currentValue) {
                    return false;
                }
                return true;
            }
        }
        return false;
    }
}

export default DateFieldRenderer;