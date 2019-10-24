import React from "react";
import ReactDOM from "react-dom";
import App from './App.jsx';

import "./assets/scss/main.scss";
import { initializeIcons } from '@uifabric/icons';

initializeIcons(undefined, { disableWarnings: true });

ReactDOM.render(<App />, document.querySelector("#app-container"));