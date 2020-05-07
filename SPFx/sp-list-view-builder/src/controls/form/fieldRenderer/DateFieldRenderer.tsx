import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { DatePicker, DayOfWeek, IDatePicker, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import moment from 'moment';
import { ITimeZoneInfo, IRegionalSettingsInfo } from '@pnp/sp/regional-settings/types';
import SPService from '../../../utilities/SPService';
import DateHelper from '../../../utilities/DateHelper';

export interface IDateFieldRendererProps extends IBaseFieldRendererProps {
    firstDayOfWeek?: number;
    shortDateFormat?: string;
    regionalSettings?: IRegionalSettingsInfo;
    timeZone?: ITimeZoneInfo;
}

export class DateFieldRenderer extends BaseFieldRenderer {

    private _datePicker: React.RefObject<IDatePicker>;
    private _timeZone: ITimeZoneInfo;
    private _regionalSettings: IRegionalSettingsInfo;

    constructor(props: IDateFieldRendererProps) {
        super(props);
        this._datePicker = React.createRef();
    }

    public async componentDidMount() {
        if ((this.props as IDateFieldRendererProps).regionalSettings) {
            this._regionalSettings = await (this.props as IDateFieldRendererProps).regionalSettings;
        }
        if ((this.props as IDateFieldRendererProps).timeZone) {
            this._timeZone = await (this.props as IDateFieldRendererProps).timeZone;
        }
        if (this._regionalSettings) {
            const locale = SPService.getLocaleName(this._regionalSettings.LocaleId);
            moment.locale(locale);
        }
        if (this.props.defaultValue) {
            const date = DateHelper.parseLocalDate(this.props.defaultValue, this._timeZone ? this._timeZone.Information.Bias : 0);
            this.setValue(date);
        }
    }

    public componentDidUpdate(prevProps: IBaseFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (prevProps.defaultValue !== this.props.defaultValue) {
            if (this.props.defaultValue /*&& !this.state.value*/) {
                const date = DateHelper.parseLocalDate(this.props.defaultValue, this._timeZone ? this._timeZone.Information.Bias : 0);
                this.setValue(date);
            }
            else{
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
        return typeof this.props.defaultValue === "string" ? (<Label>{this.props.defaultValue}</Label>) : null;
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled, firstDayOfWeek, shortDateFormat } = this.props as IDateFieldRendererProps;
        const { value } = this.state;
        const dateStrings = undefined; // {} as IDatePickerStrings;
        return <DatePicker
            componentRef={this._datePicker}
            disabled={disabled}
            allowTextInput={true}
            firstDayOfWeek={firstDayOfWeek}
            strings={dateStrings}
            value={value}
            placeholder="Select a date..."
            ariaLabel="Select a date"
            onSelectDate={(date) => this.setValue(date)}
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

    public getValue() {
        return DateHelper.toUTCString(this.state.value, this._timeZone ? this._timeZone.Information.Bias : 0);
    }
}