import * as React from 'react';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { DatePicker, DayOfWeek, IDatePicker, IDatePickerStrings, Label, ComboBox, IComboBox, IComboBoxOption, Stack } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import moment from 'moment';
import { ITimeZoneInfo, IRegionalSettingsInfo } from '@pnp/sp/regional-settings/types';
import SPService from '../../../utilities/SPService';
import DateHelper from '../../../utilities/DateHelper';
import { DataType } from '../../../utilities/Entities';
//import { DateTimePicker, DateConvention, TimeConvention, TimeDisplayControlType } from '@pnp/spfx-controls-react/lib/dateTimePicker';

export interface IDateFieldRendererProps extends IBaseFieldRendererProps {
    firstDayOfWeek?: number;
    shortDateFormat?: string;
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
    isTime24?: boolean;
}

export class DateFieldRenderer extends BaseFieldRenderer {

    private _datePicker: React.RefObject<IDatePicker>;
    //private _dateTimePicker: React.RefObject<DateTimePicker>;
    private _dateTimePicker: React.RefObject<IComboBox>;
    private _time: string;
    private _timeZone: ITimeZoneInfo;
    private _regionalSettings: IRegionalSettingsInfo;

    constructor(props: IDateFieldRendererProps) {
        super(props);
        this._datePicker = React.createRef();
        this._dateTimePicker = React.createRef();
    }

    public async componentDidMount() {
        if ((this.props as IDateFieldRendererProps).regionalSettings) {
            this._regionalSettings = (this.props as IDateFieldRendererProps).regionalSettings;
        }
        if ((this.props as IDateFieldRendererProps).timeZone) {
            this._timeZone = (this.props as IDateFieldRendererProps).timeZone;
        }
        if (this._regionalSettings) {
            const locale = SPService.getLocaleName(this._regionalSettings.LocaleId);
            moment.locale(locale);
        }
        if (this.props.defaultValue) {
            const date = DateHelper.parseLocalDate(this.props.defaultValue, this._timeZone ? this._timeZone.Information.Bias : 0);
            this.setValue(date);
        }
        else {
            this.setValue(null);
        }
    }

    public componentDidUpdate(prevProps: IBaseFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (prevProps.defaultValue !== this.props.defaultValue) {
            if (this.props.defaultValue) {
                const date = DateHelper.parseLocalDate(this.props.defaultValue, this._timeZone ? this._timeZone.Information.Bias : 0);
                this.setValue(date);
            }
            else {
                this.setValue(null);
            }
        }
    }

    protected onRenderNewForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderEditForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderDispForm() {
        if (this.props.defaultValue) {
            const date = DateHelper.parseLocalDate(this.props.defaultValue, this._timeZone ? this._timeZone.Information.Bias : 0);
            const dateString = this.props.dataType === DataType.Date ? moment(date).format("L") : moment(date).format("L LT");
            return <Label>{dateString}</Label>;
        }
        return null;
    }

    private _renderNewOrEditForm() {
        const { dataType, isTime24 } = this.props as IDateFieldRendererProps;
        const { value } = this.state;
        if (dataType === DataType.Date) {
            return this.renderDatePicker();
        }
        return <Stack tokens={{ childrenGap: 2 }}>
            {this.renderDatePicker()}
            <ComboBox
                componentRef={this._dateTimePicker}
                allowFreeform={true}
                autoComplete="on"
                text={!!value ? moment(value).format("LT") : ""}
                placeholder="Select a time..."
                onChange={(e, option: IComboBoxOption, index: number, text: string) => {
                    this._time = option ? option.text : text;
                    if (value) {
                        const time = this._time ? moment(this._time, isTime24 ? "HH:mm" : "hh:mm A") : null;
                        let hours = 0, minutes = 0;
                        if (time) {
                            hours = time.hours();
                            minutes = time.minutes();
                        }
                        const newDate = moment(value).startOf('day').set('hours', hours).set('minutes', minutes).toDate();
                        this.setValue(newDate);
                    }
                }}
                options={this.getTimePickerOptions(/*isTime24 !== undefined
                    ? isTime24 === true
                    : (this._regionalSettings && this._regionalSettings.Time24 === true),
                    this._regionalSettings ? this._regionalSettings.TimeSeparator : undefined*/)}
            />
        </Stack>;
        /*return <DateTimePicker
            ref={this._dateTimePicker}
            disabled={disabled}
            strings={dateStrings}
            firstDayOfWeek={this._regionalSettings ? this._regionalSettings.FirstDayOfWeek : firstDayOfWeek}
            dateConvention={DateConvention.DateTime}
            timeConvention={this._regionalSettings && this._regionalSettings.Time24 === true ? TimeConvention.Hours24 : TimeConvention.Hours12}
            value={value}
            showSeconds={false}
            placeholder="Select a date..."
            formatDate={(date) => this._onFormatDate(date, shortDateFormat || "L")}
            timeDisplayControlType={TimeDisplayControlType.Dropdown}            
            onChange={(date) => this.setValue(date)} />*/
    }

    private getTimePickerOptions(/*isTime24: boolean, separator?: string*/): IComboBoxOption[] {
        const options: IComboBoxOption[] = [];
        /*if (!separator) {
            separator = ":";
        }*/
        for (let hh = 0; hh < 24; hh++) {
            for (let mmStep = 0; mmStep < 2; mmStep++) {
                const timeStr = moment()/*.startOf('day')*/.set('hours', hh).set('minutes', mmStep > 0 ? 30 : 0).format("LT");
                options.push({ key: timeStr, text: timeStr });
            }
        }
        return options;

    }

    private renderDatePicker(): JSX.Element {
        const { disabled, firstDayOfWeek, shortDateFormat, dataType, isTime24 } = this.props as IDateFieldRendererProps;
        const { value } = this.state;
        const dateStrings = undefined; // {} as IDatePickerStrings;     
        return <DatePicker
            componentRef={this._datePicker}
            disabled={disabled}
            allowTextInput={true}
            firstDayOfWeek={this._regionalSettings ? this._regionalSettings.FirstDayOfWeek : firstDayOfWeek}
            strings={dateStrings}
            value={value}
            placeholder="Select a date..."
            ariaLabel="Select a date"
            onSelectDate={(date) => {
                if (date) {
                    if (this._dateTimePicker.current) {
                        if (this._time) {
                            const time = this._time ? moment(this._time, isTime24 ? "HH:mm" : "hh:mm A") : null;
                            let hours = 0, minutes = 0;
                            if (time) {
                                hours = time.hours();
                                minutes = time.minutes();
                            }
                            date = moment(date)/*.startOf('day')*/.set('hours', hours).set('minutes', minutes).toDate();
                        }
                    }
                }
                this.setValue(date);
            }}
            formatDate={(date) => this._onFormatDate(date, shortDateFormat || "L")}
            parseDateFromString={(str) => this._onParseDateFromString(str, shortDateFormat || "L")}
        />;
    }

    private _onFormatDate(date: Date, format: string) {
        return moment(date).format(format);
    }

    private _onParseDateFromString(value: string, format: string) {
        return moment(value, format).toDate();
    }

    public setValue(newValue: any) {
        this._time = newValue ? moment(newValue).format("LT") : null;
        super.setValue(newValue);
    }

    public getValue() {
        return DateHelper.toUTCString(this.state.value, this._timeZone ? this._timeZone.Information.Bias : 0);
    }
}