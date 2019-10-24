import React from "react";
import {TaskList} from './components/Tasks.jsx';
import { AppService } from "./services/AppService";

const App = () => {
    const service = new AppService();
    return <div><TaskList service={service}></TaskList></div > ;
};

export default App;