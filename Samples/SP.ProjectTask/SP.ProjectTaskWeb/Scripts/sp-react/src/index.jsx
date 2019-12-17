import React from "react";
import ReactDOM from "react-dom";
/* IE -- start */
require('es6-shim');
//import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';
import 'url-polyfill';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import "babel-polyfill";
import "current-script-polyfill";
/* IE -- end */
//require("bootstrap");
import "./Prototypes";

window._currentCulture = window._currentCulture ||
    {
        abbreviatedDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        abbreviatedMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""],
        currencyDecimalSeparator: ".",
        currencyGroupSeparator: ",",
        dateSeparator: "/",
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        firstDayOfWeek: 0,
        fullDateTimeFormat: "dddd, MMMM dd, yyyy h:mm:ss tt",
        longDateFormat: "dddd, MMMM dd, yyyy",
        longTimeFormat: "h:mm:ss tt",
        monthDayFormat: "MMMM dd",
        monthGenitiveNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
        name: "en-US",
        negativeSign: "-",
        numberDecimalSeparator: ".",
        numberGroupSeparator: ",",
        percentDecimalSeparator: ".",
        percentGroupSeparator: ",",
        shortDateFormat: "M/d/yyyy",
        shortTimeFormat: "h:mm tt",
        shortestDayNames: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        timeSeparator: ":",
        twoLetterISOLanguageName: "en"
    }
    /*{
        abbreviatedDayNames: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        abbreviatedMonthNames: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек", ""],
        currencyDecimalSeparator: ",",
        currencyGroupSeparator: " ",
        dateSeparator: ".",
        dayNames: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
        firstDayOfWeek: 1,
        fullDateTimeFormat: "d MMMM yyyy 'г.' H:mm:ss",
        longDateFormat: "d MMMM yyyy 'г.'",
        longTimeFormat: "H:mm:ss",
        monthDayFormat: "MMMM dd",
        monthGenitiveNames: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря", ""],
        monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь", ""],
        name: "ru-RU",
        negativeSign: "-",
        numberDecimalSeparator: ",",
        numberGroupSeparator: " ",
        percentDecimalSeparator: ",",
        percentGroupSeparator: " ",
        shortDateFormat: "dd.MM.yyyy",
        shortTimeFormat: "H:mm",
        shortestDayNames: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        timeSeparator: ":",
        twoLetterISOLanguageName: "ru",
    }*/;

window._spPageContextInfo = window._spPageContextInfo ||
    {
        regionalSettings: {
            adjustHijriDays: 0,
            alternateCalendarType: 0,
            am: "AM",
            calendarType: 1,
            collation: 25,
            collationLCID: 2070,
            dateFormat: 0,
            dateSeparator: "/",
            decimalSeparator: ".",
            digitGrouping: "3;0",
            firstDayOfWeek: 0,
            firstWeekOfYear: 0,
            isEastAsia: false,
            isRightToLeft: false,
            isUIRightToLeft: false,
            listSeparator: ",",
            localeId: 1033,
            negNumberMode: 1,
            negativeSign: "-",
            pm: "PM",
            positiveSign: "",
            showWeeks: false,
            thousandSeparator: ",",
            time24: false,
            timeMarkerPosition: 0,
            timeSeparator: ":",
            tzBias: -60,
            workDayEnd: 1020,
            workDayStart: 480,
            workDays: 62
        },
        siteAbsoluteUrl: "",
        siteServerRelativeUrl: "/",
        user: {
            Id: 1073741822,
            Initials: "a@s",
            Name: "app@sharepoint",
            Login: "i:0i.t|00000003-0000-0ff1-ce00-000000000000|app@sharepoint",
            Email: ""
        },
        webAbsoluteUrl: "",
        webLanguage: 1033,
        webServerRelativeUrl: "",
        layoutsUrl: "_layouts/15",
        webTitle: "Project Task",
        webUIVersion: 15,
        BASE_PATH: (window._spPageContextInfo == undefined ? "https://localhost:44318" : "")
    };

import App from './App';
import { AppService } from "./services/AppService";

const service = new AppService();
ReactDOM.render(<App service={service} />, document.querySelector("#app-container"));

