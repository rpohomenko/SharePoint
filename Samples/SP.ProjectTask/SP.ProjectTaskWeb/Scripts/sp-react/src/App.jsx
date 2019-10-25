import React from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import NavBar from './components/NavBar.jsx'
import SidebarMenu from './components/SidebarMenu.jsx'
import Content from './components/Content.jsx'
import Footer from './components/Footer.jsx'

const App = () => {
    return (<Fabric className="app">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <NavBar />
        </nav>
        <div className="container-fluid">
            <div className="row">
                <nav className="col-md-2 d-none d-md-block bg-light sidebar">
                    <SidebarMenu className="col-md-2 d-none d-md-block bg-light sidebar" />
                </nav>
                <main role="main" className="col-md-9 ml-sm-auto col-md-10 px-4">
                    <Content />
                </main>                
            </div>
        </div>
    </Fabric>);
};

export default App;