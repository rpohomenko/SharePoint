import React from 'react'
import PropTypes from 'prop-types';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb'
import Tasks from './lists/Tasks';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

class Content extends React.Component {
    constructor() {
        super()
        this.state = {
            selectedTab: "tasks"
        }
    }

    componentDidMount() {

    }

    _onPivotHandle = (item) => {
        this.setState({
            selectedTab: item.props.itemKey
        });
    };

    _getBreadcrumbs = (contentId)=>{
        let breadcrumbs = [];
        breadcrumbs.push({
            text: 'Home', 'key': 0, onClick: contentId === 0  || contentId > 0 ? () => {
                this.props.onRoute(null);
            } : null
        });
      
        switch (contentId) {
            case 0:             
                breadcrumbs.push({
                    text: 'Tasks', 'key': 1
                });
                break;
            case 1:
            case 2:
            case 3:
                break;
            default:             
                break;
        }
        return breadcrumbs;
    }

    _getContent = (contentId, selectedTab, service)=>{
        let content;
        switch (contentId) {
            case 0:
                content = (<Tasks service={service}></Tasks>);              
                break;
            case 1:
            case 2:
            case 3:
                break;
            default:
                const pivotContent = {
                    "tasks": (<Tasks service={service}></Tasks>)
                };

                content = (<div><span>Welcome to Project Tasks!</span>
                    <Pivot selectedKey={selectedTab} onLinkClick={this._onPivotHandle} headersOnly={true} getTabId={this._getTabId}>
                        <PivotItem headerText="Tasks" itemKey="tasks" />
                        <PivotItem headerText="Projects" itemKey="projects" />
                    </Pivot>
                    {pivotContent[selectedTab]}
                </div>);
                break;
        }
        return content;
    }

    render() {       
        const { contentId, maxBreadcrumbs, service } = this.props;
        const { selectedTab } = this.state;    
       
        return (
            <div>
                <Breadcrumb className="breadcrumbs" items={this._getBreadcrumbs(contentId)}
                    maxDisplayedItems={maxBreadcrumbs}
                />
                {this._getContent(contentId, selectedTab, service)}
            </div>
        );
    }
}

Content.propTypes = {
    maxBreadcrumbs: PropTypes.number,
    onRoute: PropTypes.func
}

Content.defaultProps = {
    maxBreadcrumbs: 3    
}

export default Content