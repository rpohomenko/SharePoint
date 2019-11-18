import React from "react";
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';

export class StatusBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ...this.props,
            statuses: null
        };
        this._counter = 0;
    }

    render() {
        const { statuses } = this.state;
        if (statuses) {
            return statuses.map((status, i) =>
                (<MessageBar key={status.key} messageBarType={status.type} isMultiline={false} onDismiss={() => {
                    this.remove(status);
                }} dismissButtonAriaLabel="Close">
                    {status.message}
                </MessageBar>));
        }
        return null;
    }

    clear() {
        this.setState({ statuses: null });
    }

    remove(status) {
        let { statuses } = this.state;
        statuses = statuses.filter((item) => item !== status && item.key !== status);
        this.setState({ statuses: statuses });
    }

    add(message, type) {
        let { statuses } = this.state;
        let status = { key: `status_${(++this._counter)}`, message: message, type: type }
        if(!statuses){
            statuses = [];
        }
        statuses.push(status);
        this.setState({ statuses: statuses });
        return status;        
    }

    info(message) {
        return this.add(message, MessageBarType.info);
    }

    warn(message) {
        return this.add(message, MessageBarType.warning);
    }

    error(message) {
        return this.add(message, MessageBarType.error);
    }

    success(message) {
        return this.add(message, MessageBarType.success);
    }
}