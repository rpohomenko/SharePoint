import moment from 'moment';

export default class DateHelper {

    public static toLocaleDate (date: Date, tzBias: number): Date {          
        return moment(date).clone().utc().add(-(moment(date).utcOffset() + tzBias), 'm').toDate();
    }

    public static toUtcDate(date: Date, tzBias: number): Date {
        return moment(date).clone().utc().add(moment(date).utcOffset() + tzBias, 'm').toDate();
    }
}