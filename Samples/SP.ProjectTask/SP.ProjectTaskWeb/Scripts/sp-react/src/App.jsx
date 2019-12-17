import React from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import NavBar from './components/NavBar'
import SidebarMenu from './components/SidebarMenu'
import Content from './components/Content'
import Footer from './components/Footer'
import ErrorBoundary from './ErrorBoundary'

import "./assets/scss/main.scss";
import { initializeIcons } from '@uifabric/icons';

initializeIcons(
    `${document.currentScript.src.substr(0, document.currentScript.src.lastIndexOf('/'))}/../fonts/`,
 { disableWarnings: true });

export class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contentId: null
        };

    }

    render() {
        const { service } = this.props;
        const { contentId } = this.state;
        const onRoute = (key) => {
            this.setState({ contentId: Number(key || -1) });
            this._sidebar.setState({ isOpen: false });
        };
        return (<ErrorBoundary>
            <Fabric className="app">             
                <NavBar />               
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-2 d-md-block bg-light sidebar sticky-top">
                            {<SidebarMenu ref={(ref) => this._sidebar = ref} className="col-md-2 d-none d-md-block bg-light sidebar" selectedKey={contentId} onRoute={onRoute} isOpen={false} />}
                        </div>
                        <div role="main" className="col-md-9 ml-sm-auto col-md-10 px-2">
                            <Content service={service} contentId={contentId} onRoute={onRoute} />
                        </div>
                    </div>
                </div>
            </Fabric>
        </ErrorBoundary>);
    }
}

export default App;