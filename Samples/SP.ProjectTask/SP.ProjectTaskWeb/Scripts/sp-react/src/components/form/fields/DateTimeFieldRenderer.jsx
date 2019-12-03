import * as React from 'react';
import { MaskedTextField, Stack, IconButton, ComboBox } from 'office-ui-fabric-react';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { getId } from 'office-ui-fabric-react/lib/Utilities';
import { DateFieldRenderer } from './DateFieldRenderer';

export class DateTimeFieldRenderer extends DateFieldRenderer {

    _timeButtonId = getId('iTimeBtn');

    constructor(props) {
        super(props);

        this._isTime24 = false;
        this._maskChar = '_';
        this._timeSeparator = ":";

        this.state = {
            ...this.state
        };

        this._onTimeChange = this._onTimeChange.bind(this);
    }

    componentDidMount() {
        super.componentDidMount();
        let props = this.props;
        let meridiem, hours = 0, minutes = 0;
        if (_spPageContextInfo && _spPageContextInfo.regionalSettings) {
            this._pm = _spPageContextInfo.regionalSettings.pm;
            this._am = _spPageContextInfo.regionalSettings.am;;
            this._isTime24 = _spPageContextInfo.regionalSettings.time24;
            this._timeSeparator = _spPageContextInfo.regionalSettings.timeSeparator;
            if (!this._isTime24) {
                meridiem = this._am;
            }
            let currentValue = props.currentValue;
            if (currentValue) {
                let date = this._getDate(currentValue, this._tzBias);
                hours = date.getHours();
                minutes = date.getMinutes();
                if (!this._isTime24) {
                    meridiem = hours >= 12 ? this._pm : this._am;
                    if (hours > 12) {
                        hours -= 12;
                    }
                    else if (hours === 0) {
                        hours = 12;
                    }
                }
            }
        }
        this.setState({
            hours: hours,
            minutes: minutes,
            meridiem: meridiem
        });
    }

    _renderDispForm() {
        let date = this.state.currentValue;
        return date ? (<span>{this._onFormatDate(date, (this.props.fieldProps.longDateFormat || "LL") + " LT")}</span>) : null;
    }

    _renderNewOrEditForm() {
        const { disabled } = this.props;
        const { hours, minutes, meridiem, showTime } = this.state;

        this._hoursOptions = Array.apply(null, Array(this._isTime24 ? 24 : 12)).map((item, i) => {
            return this._isTime24 ? { key: i, text: `${i < 10 ? '0' : ''}${i}` } : { key: i + 1, text: `${i < 9 ? '0' : ''}${(i + 1)}` };
        });
        this._minutesOptions = Array.apply(null, Array(60)).map((item, i) => {
            return { key: i, text: `${i < 10 ? '0' : ''}${i}` };
        });
        if (!this._isTime24) {
            this._meridiemOptions = [{ key: this._am, text: this._am }, { key: this._pm, text: this._pm }];
        }

        let mask = !this._isTime24
            ? `99${this._timeSeparator}99${meridiem ? ' ' + new Array(meridiem.length + 1).join('*') : ''}`
            : `99${this._timeSeparator}99`;
        let value = this._formatTime(hours, minutes, meridiem);
        return <div className="row">
            <div className="col-8">
                {super._renderNewOrEditForm()}
            </div>
            <div className="col">
                <Stack tokens={{ childrenGap: 2 }} horizontal>
                    <MaskedTextField
                        disabled={disabled}
                        ref={ref => this._timeField = ref}
                        mask={mask}
                        maskChar={this._maskChar}
                        maskFormat={{
                            '9': /[0-9]/,
                            '*': /[A-Z]/
                        }}
                        style={{ width: "100%" }}
                        value={value}
                        onChange={(ev, value) => this._onTimeChange(value)}
                        onClick={() => null/*this.setState({ showTime: true })*/}
                    />
                    <IconButton id={this._timeButtonId} iconProps={{ iconName: 'TimePicker' }} ariaLabel="Time" disabled={disabled} checked={showTime} onClick={() => this.setState({ showTime: !this.state.showTime })} />
                </Stack>
                {showTime && (
                    <Callout
                        setInitialFocus={true}
                        target={'#' + this._timeButtonId}
                        onDismiss={() => this.setState({ showTime: false })}
                        role="alertdialog">
                        <div className="time-picker" style={{ margin: '10px', fontSize: '14pt' }}>
                            <Stack tokens={{ childrenGap: 4 }} horizontal> <ComboBox
                                selectedKey={hours}
                                allowFreeform
                                autoComplete="on"
                                options={this._hoursOptions}
                                onChange={(e, option) => {
                                    if (option)
                                        this._changeDateTime(option.key, minutes, meridiem);
                                }}
                            />
                                <span>{this._timeSeparator}</span>
                                <ComboBox
                                    selectedKey={minutes}
                                    allowFreeform
                                    autoComplete="on"
                                    options={this._minutesOptions}
                                    onChange={(e, option) => {
                                        if (option)
                                            this._changeDateTime(hours, option.key, meridiem);
                                    }}
                                />
                                {!this._isTime24 &&
                                    <ComboBox
                                        selectedKey={meridiem}
                                        allowFreeform
                                        autoComplete="on"
                                        options={this._meridiemOptions}
                                        onChange={(e, option) => {
                                            if (option)
                                                this._changeDateTime(hours, minutes, option.key);
                                        }} />
                                }

                            </Stack>
                        </div>

                    </Callout>
                )}
            </div>
        </div>;
    }

    _onDateChange(date) {
        /*if (date) {
            let { hours, minutes, meridiem } = this.state;
            if (!this._isTime24) {
                hours = meridiem === this._pm ? hours + 12 : hours;
            }
            date.setHours(hours);
            date.setMinutes(minutes);
        }*/
        const { hours, minutes, meridiem } = this.state;
        let newHours = this._isTime24 ? 0 : 12;
        let newMinutes = 0;
        let newMeridiem = this._am;
        if (hours !== newHours || minutes !== newMinutes || meridiem !== newMeridiem) {
            this.setState({ hours: newHours, minutes: newMinutes, meridiem: newMeridiem });
        }
        super._onDateChange(date)
    }

    _formatTime = (hours, minutes, meridiem) => {
        return `${hours > 9 ? hours : `0${hours}`}${this._timeSeparator}${minutes > 9 ? minutes : `0${minutes}`}${(meridiem ? ' ' + meridiem : '')}`;
    };

    _getHours(hours) {
        if (hours > 12) {
            if (this._isTime24) {
                if (hours > 23)
                    hours = 0;
            }
            else {
                if (hours > 23) {
                    hours = 12;
                }
                else {
                    hours -= 12;
                }
            }
        }
        else if (hours < 1) {
            if (this._isTime24) {
                hours = 0;
            }
            else {
                hours = 12;
            }
        }
        return hours;
    }

    _getMeridiem(hours, meridiem) {
        if (this._isTime24) {
            return "";
        }
        if (hours > 12) {
            if (hours > 23) {
                meridiem = this._am;
            }
            else {
                meridiem = this._pm;
            }
        }
        else if (hours < 1) {
            meridiem = this._am;
        }
        return meridiem;
    }

    _getMinutes(minutes) {
        if (minutes < 0 || minutes > 59) {
            minutes = 0;
        }
        return minutes;
    }

    _changeDateTime = (hours, minutes, meridiem) => {
        this.setState({ hours: hours, minutes: minutes, meridiem: meridiem });
        let date = this.state.value;
        let newDate = new Date(date.getTime());
        if (!this._isTime24) {
            if (hours == 12) {
                if (meridiem === this._am) {
                    hours = 0;
                }
            }
            else {
                hours = meridiem === this._pm ? hours + 12 : hours;
            }
        }
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        this.setValue(newDate);
    }

    _onTimeChange = (value) => {
        if (value) {
            const { hours, minutes, meridiem } = this.state;
            let matches = value.match(new RegExp(`(?<hours>\\d{2})${this._timeSeparator}(?<minutes>\\d{2})\\s*(?<meridiem>\\w*)`));
            if (matches && matches.groups) {
                let newHours = Number(matches.groups["hours"]);
                let newMinutes = Number(matches.groups["minutes"]);
                let newMeridiem = matches.groups["meridiem"];
                newMeridiem = this._getMeridiem(newHours, newMeridiem);
                newHours = this._getHours(newHours);
                newMinutes = this._getMinutes(newMinutes);
                let newValue;
                if (!this._isTime24) {
                    if (newMeridiem.indexOf(this._maskChar) === -1) {
                        if (newMeridiem !== this._am && newMeridiem !== this._pm) {
                            newMeridiem = meridiem;
                        }
                        newValue = this._formatTime(newHours, newMinutes, newMeridiem);
                    }
                    else {
                        newValue = this._formatTime(newHours, newMinutes, newMeridiem);
                        newMeridiem = meridiem;
                    }
                }
                else {
                    newValue = this._formatTime(newHours, newMinutes);
                }
                if (newValue !== value || newHours !== hours || newMinutes !== minutes || newMeridiem !== meridiem) {
                    //this.setState({ hours: newHours, minutes: newMinutes, meridiem: newMeridiem });
                    if (this._timeField) {
                        this._timeField.setState({ displayValue: newValue });
                    }
                    this._changeDateTime(newHours, newMinutes, newMeridiem);
                }
            }
        }
    }
}

export default DateTimeFieldRenderer;