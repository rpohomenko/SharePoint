import React from 'react'
import PropTypes from 'prop-types';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb'
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import Tasks from './lists/Tasks';
import Projects from './lists/Projects';
import Employees from './lists/Employees';
import Departments from './lists/Departments';

class Content extends React.Component {
    constructor() {
        super()
        this.state = {
            selectedTab: "tasks"
        }
    }

    componentDidMount() {

    }

    render() {
        const { contentId, maxBreadcrumbs, service } = this.props;
        const { selectedTab } = this.state;

        return (
            <>
                <Breadcrumb className="breadcrumbs" items={this._getBreadcrumbs(contentId)}
                    maxDisplayedItems={maxBreadcrumbs}
                />
                <div className="content">
                    {this._getContent(contentId, selectedTab, service)}
                </div>
            </>
        );
    }

    _onPivotHandle = (item) => {
        this.setState({
            selectedTab: item.props.itemKey
        });
    };

    _getBreadcrumbs = (contentId) => {
        let breadcrumbs = [];
        breadcrumbs.push({
            text: 'Home', 'key': 0, onClick: contentId === 0 || contentId > 0 ? () => {
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
                breadcrumbs.push({
                    text: 'Projects', 'key': 2
                });
                break;
            case 2:
                breadcrumbs.push({
                    text: 'Employees', 'key': 3
                });
                break;
            case 3:
                breadcrumbs.push({
                    text: 'Departments', 'key': 4
                });
                break;
            default:
                break;
        }
        return breadcrumbs;
    }

    _getContent = (contentId, selectedTab, service) => {
        let content;
        switch (contentId) {
            case 0:
                content = (<Tasks service={service}></Tasks>);
                break;
            case 1:
                content = (<Projects service={service}></Projects>);
                break;
            case 2:
                content = (<Employees service={service}></Employees>);
                break;
            case 3:
                content = (<Departments service={service} />);
                break;
            default:
                const pivotContent = {
                    "tasks": (<Tasks service={service} />),
                    "projects": (<Projects service={service} />),
                    "employees": (<Employees service={service} />),
                    "departments": (<Departments service={service} />)
                };

                content = (<>
                    <Pivot selectedKey={selectedTab} onLinkClick={this._onPivotHandle} headersOnly={true} getTabId={this._getTabId}>
                        <PivotItem headerText="Tasks" itemKey="tasks" />
                        <PivotItem headerText="Projects" itemKey="projects" />
                        <PivotItem headerText="Employees" itemKey="employees" />
                        <PivotItem headerText="Departments" itemKey="departments" />
                    </Pivot>
                    {pivotContent[selectedTab]}
                </>);
                break;
        }
        return content;
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