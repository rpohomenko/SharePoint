import React from "react";
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import NavBar from './components/NavBar'
import SidebarMenu from './components/SidebarMenu'
import Content from './components/Content'
import Footer from './components/Footer'
import ErrorBoundary from './ErrorBoundary'

import "./assets/scss/main.scss";
import { initializeIcons } from '@uifabric/icons';

import {
    loadTheme
} from "office-ui-fabric-react";

import { lightTheme } from "./theme/Themes";

let baseIconPath;
//document.currentScript.src.substr(0, document.currentScript.src.lastIndexOf('/'));
/*if(baseIconPath){
    baseIconPath = baseIconPath.substr(0, baseIconPath.lastIndexOf('/'));
}*/
baseIconPath = window.location.port === "3000" ? "../fonts/" : "/scripts/sp-react/dist/fonts/";
initializeIcons(baseIconPath,
    { disableWarnings: true });

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contentId: null
        };

        this._currentTheme = lightTheme;
        loadTheme(this._currentTheme);
    }

    render() {
        const { service } = this.props;
        const { contentId, isFullScreen } = this.state;
        const onRoute = (key) => {
            this.setState({ contentId: Number(key || -1) });
            this._sidebar.setState({ isOpen: false });
        };
        let className = "app";
        if (_spPageContextInfo && _spPageContextInfo.isWebPart) {
            className += " webpart";
        }

        if (isFullScreen) {
            className += " fullscreen";
        }

        return (<ErrorBoundary>
            <Fabric className={className}>
                <NavBar />
                <div className="container-fluid">
                    <div className="row">
                        {!isFullScreen && (<div className="col-md-2 d-md-block bg-light sidebar sticky-top">
                            <SidebarMenu ref={(ref) => this._sidebar = ref} className="col-md-2 d-none d-md-block bg-light sidebar" selectedKey={contentId} onRoute={onRoute} isOpen={false} />
                        </div>
                        )}
                        <div role="main" className={`col-md-${isFullScreen ? 12 : 9} ml-sm-auto col-md-10 px-2`}>
                            <Content service={service} contentId={contentId} onRoute={onRoute}
                                onFullScreen={(enabled) => this.setState({ isFullScreen: enabled })} />
                        </div>
                    </div>
                </div>
            </Fabric>
        </ErrorBoundary>);
    }
}

export default App;