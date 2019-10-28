import React from 'react'
import PropTypes from 'prop-types';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb'
import Tasks from './Tasks.jsx';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

class Content extends React.Component {
    constructor() {
        super()
        this.state = {
            selectedKey: "tasks"
        }
    }

    componentDidMount() {

    }

    _onPivotHandle = (item) => {
        this.setState({
            selectedKey: item.props.itemKey
        });
    };

    render() {       
        const { contentId, maxBreadcrumbs, service } = this.props;
        const { selectedKey } = this.state;

        let breadcrumbs = [];
        breadcrumbs.push({
            text: 'Home', 'key': 0, onClick: contentId === 0  || contentId > 0 ? () => {
                this.props.onRoute(null);
            } : null
        });

        let content;
        switch (contentId) {
            case 0:
                content = (<Tasks service={service}></Tasks>);
                breadcrumbs.push({
                    text: 'Tasks', 'key': 1
                });
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
                    <Pivot selectedKey={selectedKey} onLinkClick={this._onPivotHandle} headersOnly={true} getTabId={this._getTabId}>
                        <PivotItem headerText="Tasks" itemKey="tasks" />
                        <PivotItem headerText="Projects" itemKey="projects" />
                    </Pivot>
                    {pivotContent[selectedKey]}
                </div>);
                break;
        }
        return (
            <div>
                <Breadcrumb className="breadcrumbs" items={breadcrumbs}
                    maxDisplayedItems={maxBreadcrumbs}
                />
                {content}
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