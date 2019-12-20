import React from "react";
import ReactDOM from "react-dom";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import ErrorBoundary from './ErrorBoundary'
import NavBar from './components/NavBar'
import { AppService } from "./services/AppService";
import { DeployManager } from "./components/DeployManager";

/* IE -- start */
import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';
import 'url-polyfill';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import "babel-polyfill";
/* IE -- end */
//require("bootstrap");

import "./assets/scss/admin.scss";

import { initializeIcons } from '@uifabric/icons';

let baseIconPath = window.location.port === "3000" ? "../fonts/" : "/scripts/sp-react/dist/fonts/";
initializeIcons(baseIconPath,
 { disableWarnings: true });

const service = new AppService();
ReactDOM.render(
    <ErrorBoundary>
        <Fabric className="app">
            <NavBar />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 d-md-block bg-light sidebar sticky-top">
                      <a href="/">Home</a>
                    </div>
                    <div role="main" className="col-md-9 ml-sm-auto col-md-10 px-0">
                        <DeployManager service={service} />
                    </div>
                </div>
            </div>
        </Fabric>
    </ErrorBoundary>
    , document.querySelector("#app-container"));