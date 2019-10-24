import React from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import NavBar from './components/NavBar.jsx'
import SidebarMenu from './components/SidebarMenu.jsx'
import Content from './components/Content.jsx'
import Footer from './components/Footer.jsx'

const App = () => {   
    return <div>
        <Fabric className="app">
            <div className="header">
             <NavBar />
            </div>
            <div className="body">
                <div className="content">
                    <Content />
                </div>
                <div className="sidebar">
                   <SidebarMenu />
                </div>
            </div>
            <div className="footer">
              
            </div>
        </Fabric>
    </div >;
};

export default App;