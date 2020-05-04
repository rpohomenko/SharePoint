import moment from 'moment';

export default class DateHelper {

    public static toLocalDate(date: Date, tzBias: number): Date {
        if (date) {
            date = moment(date).clone().add(-(moment(date).utcOffset() + tzBias), 'm').toDate();
            return date;
        }
    }

    public static toUtcDate(date: Date, tzBias: number): Date {
        if (date) {
            date = moment(date).clone().add(moment(date).utcOffset() + tzBias, 'm').toDate();
            return date;
        }
    }

    public static toUTCString(date: Date, tzBias: number): string {
        if (date) {
            date = DateHelper.toUtcDate(date, tzBias);
            return moment(date).utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
        }
    }

    public static toUTCString2(date: Date, tzBias: number): string {
        if (date) {
            return moment(DateHelper.toUtcDate(date, tzBias)).format('D/M/YYYY h:m A');
        }
    }

    public static parseLocalDate(dateStr: string, tzBias: number): Date {
        if (dateStr) {
            return DateHelper.toLocalDate(new Date(dateStr), tzBias);
        }
    }

    public static parseUtcDate(dateStr: string, tzBias: number): Date {
        if (dateStr) {
            return DateHelper.toUtcDate(new Date(dateStr), tzBias);
        }
    }
}