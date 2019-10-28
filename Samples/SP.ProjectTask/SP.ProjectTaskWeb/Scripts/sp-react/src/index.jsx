import React from "react";
import ReactDOM from "react-dom";
import App from './App.jsx';
import { AppService } from "./services/AppService";

/* IE */
import 'promise-polyfill/src/polyfill'; 
import 'whatwg-fetch';
import 'url-polyfill';
/* IE */
//require("bootstrap");

const service = new AppService();

ReactDOM.render(<App service={service} />, document.querySelector("#app-container"));