import React from "react";
import ReactDOM from "react-dom";
/* IE -- start */
import 'react-app-polyfill/ie11';
require('es6-shim');
//import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';
import 'url-polyfill';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import "babel-polyfill";
import "current-script-polyfill";
/* IE -- end */
//require("bootstrap");

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

window._isMobile = false;
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        window._isMobile = true;
}

import "./Prototypes";
import App from './App';
import { AppService } from "./services/AppService";

const service = new AppService();
ReactDOM.render(<App service={service} />, document.querySelector("#app-container"));

