import React from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import NavBar from './components/NavBar.jsx'
import SidebarMenu from './components/SidebarMenu.jsx'
import Content from './components/Content.jsx'
import Footer from './components/Footer.jsx'

import "./assets/scss/main.scss";
import { initializeIcons } from '@uifabric/icons';

initializeIcons(undefined, { disableWarnings: true });

export class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contentId: null,
            selectedKey: null
        };
      
    }

    render() {
        const {service} = this.props;
        const { contentId, selectedKey } = this.state;
        const onRoute =(key) => {
            this.setState({ contentId: Number(key || -1), selectedKey:key });
        };
        return (<Fabric className="app">
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                <NavBar />
            </nav>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 d-md-block bg-light sidebar">
                        {<SidebarMenu className="col-md-2 d-none d-md-block bg-light sidebar" selectedKey={selectedKey} onRoute={onRoute} />}
                    </div>
                    <div role="main" className="col-md-9 ml-sm-auto col-md-10 px-4">
                        <Content service={service} contentId={contentId} onRoute={onRoute}/>
                    </div>
                </div>
            </div>
        </Fabric>);
    }
}

export default App;