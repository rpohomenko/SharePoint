import React from 'react'
import PropTypes from 'prop-types';
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb'
import { AppService } from "../services/AppService";
import Tasks from './Tasks.jsx';

class Content extends React.Component {
    constructor() {
        super()
        this.state = {
        }
    }

    componentDidMount() {

    }

    render() {
        const service = new AppService();
        const { breadcrumbs, maxBreadcrumbs } = this.props;

        return (
            <div>
                <Breadcrumb className="breadcrumbs" items={breadcrumbs}
                    maxDisplayedItems={maxBreadcrumbs}
                />
                <Tasks service={service}></Tasks>
            </div>
        );
    }
}

Content.propTypes = {
    maxBreadcrumbs: PropTypes.number
}

Content.defaultProps = {
    maxBreadcrumbs: 3,
    breadcrumbs: [
        { text: 'Home', 'key': 'f5' }
    ]
}

export default Content