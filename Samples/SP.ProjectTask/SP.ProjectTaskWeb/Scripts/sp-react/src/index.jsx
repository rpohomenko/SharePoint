import React from "react";
import ReactDOM from "react-dom";
import App from './App';
import { AppService } from "./services/AppService";

/* IE -- start */
import 'promise-polyfill/src/polyfill'; 
import 'whatwg-fetch';
import 'url-polyfill';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import "babel-polyfill";
/* IE -- end */
//require("bootstrap");

const service = new AppService();
ReactDOM.render(<App service={service} />, document.querySelector("#app-container"));