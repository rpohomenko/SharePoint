import * as React from 'react';
import { MaskedTextField } from 'office-ui-fabric-react';
import { DateFieldRenderer } from './DateFieldRenderer';
import { Label } from 'office-ui-fabric-react/lib/Label';

export class DateTimeFieldRenderer extends DateFieldRenderer {
    constructor(props) {
        super(props);
        let meridiem, hours = 0, minutes = 0;
        this._isTime24 = false;
        this._maskChar = '_';
        if (_spPageContextInfo && _spPageContextInfo.regionalSettings) {
            this._pm = _spPageContextInfo.regionalSettings.pm;
            this._am = _spPageContextInfo.regionalSettings.am;;
            this._isTime24 = _spPageContextInfo.regionalSettings.time24;
            if (!this._isTime24) {
                meridiem = this._am;
            }
            let date = this.state.currentValue;
            if (date) {
                hours = date.getHours();
                minutes = date.getMinutes();
                if (!this._isTime24) {
                    meridiem = hours >= 12 ? this._pm : this._am;
                }
            }
        }
        this.state = {
            ...this.state,
            hours: hours,
            minutes: minutes,
            meridiem: meridiem
        };

        this._onTimeChange = this._onTimeChange.bind(this);
    }

    _renderDispForm() {
        let date = this.state.currentValue;
        return date ? (<Label>{this._onFormatDate(date, (this.props.fieldProps.longDateFormat || "LL") + " LT")}</Label>) : null;
    }

    _renderNewOrEditForm() {
        const { hours, minutes, meridiem } = this.state;
        let mask = meridiem
            ? `99:99${meridiem ? ' ' + new Array(meridiem.length + 1).join('*') : ''}`
            : "99:99";
        let value = `${hours > 9 ? hours : `0${hours}`}:${minutes > 9 ? minutes : `0${minutes}`}${(meridiem ? ' ' + meridiem : '')}`;
        return <div className="row">
            <div className="col-8">
                {super._renderNewOrEditForm()}
            </div>
            <div className="col">
                <MaskedTextField
                    ref={ref => this._time = ref}
                    mask={mask}
                    maskChar={this._maskChar}
                    maskFormat={{
                        '9': /[0-9]/,
                        '*': /[A-Z]/
                    }}
                    style={{ width: "100%" }}
                    value={value}
                    onChange={(ev, value) => this._onTimeChange(value)}
                    onClick={() => this.setState({ showTime: true })}
                />
            </div>
        </div>;
    }

    _onDateChange(date) {
        if (date) {
            let { hours, minutes, meridiem } = this.state;
            if (!this._isTime24) {
                hours = meridiem === this._pm ? hours + 12 : hours;
            }
            date.setHours(hours);
            date.setMinutes(minutes);
        }
        super._onDateChange(date)
    }

    _onTimeChange = (value) => {
        if (value) {
            const { hours, minutes, meridiem } = this.state;
            let matches = value.match(/(?<hours>\d{2}):(?<minutes>\d{2})\s*(?<meridiem>\w*)/);
            if (matches && matches.groups) {
                let newHours = Number(matches.groups["hours"]);
                let newMinutes = Number(matches.groups["minutes"]);
                let newMeridiem = matches.groups["meridiem"];
                if (newHours > 12) {
                    if (this._isTime24 && newHours > 23) {
                        newHours = 0;
                    }
                    else {
                        if (newHours > 23) {
                            newHours = 12;
                            newMeridiem = this._am;
                        }
                        else {
                            newHours -= 12;
                            newMeridiem = this._pm;
                        }
                    }
                }
                else if (newHours < 1) {
                    if (this._isTime24) {
                        newHours = 0;
                    }
                    else {
                        newHours = 12;
                        newMeridiem = this._am;
                    }
                }

                if (newMinutes < 0 || newMinutes > 59) {
                    newMinutes = 0;
                }

                let newValue;
                if (newMeridiem.indexOf(this._maskChar) === -1) {
                    if (newMeridiem !== this._am && newMeridiem !== this._pm) {
                        newMeridiem = meridiem;
                    }
                    newValue = `${newHours > 9 ? newHours : `0${newHours}`}:${newMinutes > 9 ? newMinutes : `0${newMinutes}`}${(newMeridiem ? ' ' + newMeridiem : '')}`;
                }
                else {
                    newValue = `${newHours > 9 ? newHours : `0${newHours}`}:${newMinutes > 9 ? newMinutes : `0${newMinutes}`}${(newMeridiem ? ' ' + newMeridiem : '')}`;
                    newMeridiem = meridiem;
                }
                if (newValue !== value || newHours !== hours || newMinutes !== minutes || newMeridiem !== meridiem) {
                    this.setState({ hours: newHours, minutes: newMinutes, meridiem: newMeridiem });
                    if (this._time) {
                        this._time.setState({ displayValue: newValue });
                    }

                    let date = this.state.value;
                    let newDate = new Date(date.getTime());
                    if (!this._isTime24) {
                        newHours = newMeridiem === this._pm ? newHours + 12 : newHours;
                    }
                    newDate.setHours(newHours);
                    newDate.setMinutes(newMinutes);
                    this.setValue(newDate);
                }
            }
        }
    }
}

export default DateTimeFieldRenderer;