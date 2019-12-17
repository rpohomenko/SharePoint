import React from "react";
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { StatusBar } from './StatusBar';

export class DeployManager extends React.Component {
    constructor(props) {
        super(props);
        this._service = props.service;
        this.state = {
            appInstalled: window._isAppInstalled
        };
    }

    componentDidMount() {
        const { appInstalled } = this.state;
        if (this._status) {
            if (appInstalled) {
                this._status.warn("App is already installed on the current site.");
            }
            else {
                this._status.warn("App is not yet installed on the current site.");
            }
        }
    }

    async componentWillUnmount() {
        await this._abort();
    }

    render() {
        const { appInstalled, isDeploying, isRetracting } = this.state;
        return (<div className="deploy-manager">
            <StatusBar ref={ref => this._status = ref} />
            <div className="action">
                {(isDeploying || isRetracting) && (<ProgressIndicator label={isDeploying ? "Deploying..." : "Retracting..."} />)}
                <DefaultButton onClick={() => this.deploy()} disabled={appInstalled || isDeploying || isRetracting} style={{ marginRight: 7 }}>Deploy</DefaultButton>
                <DefaultButton onClick={() => this.retract()} disabled={!appInstalled || isDeploying || isRetracting}>Retract</DefaultButton>
            </div>
        </div>);
    }

    async deploy() {
        let controller = new AbortController();
        const promise = this._service.deploy({ signal: controller ? controller.signal : null });
        this._controller = controller;
        this.setState({ isDeploying: true });
        return await this._onPromise(promise, (json) => {
            this.setState({
                isDeploying: false,
                appInstalled: json && json.ok
            });
            if (this._status) {
                this._status.clear();
                this._status.success("Deployed successfully.");
            }
            this._controller = null;
            return { ok: true, data: json }; // OK
        }).then((result) => {
            this.setState({
                isDeploying: false
            });
            this._controller = null;
            return result;
        });
    }

    async retract() {
        let controller = new AbortController();
        const promise = this._service.retract({ signal: controller ? controller.signal : null });
        this._controller = controller;
        this.setState({ isRetracting: true });
        return await this._onPromise(promise, (json) => {
            this.setState({
                isRetracting: false,
                appInstalled: json && !json.ok
            });
            if (this._status) {
                this._status.clear();
                this._status.success("Retracted successfully.");
            }
            this._controller = null;
            return { ok: true, data: json }; // OK
        }).then((result) => {
            this.setState({
                isRetracting: false
            });
            this._controller = null;
            return result;
        });
    }

    _abort = async () => {
        if (this._controller != null) {
            try {
                this._controller.abort();
            }
            catch{ }
            this._controller = null;
        }
    }

    _onPromise = async (promise, onSuccess) => {
        if (promise) {
            return await promise.then(response => {
                if (response.ok) {
                    return response.json().then(onSuccess);
                }
                else {
                    return response.json().then((error) => {
                        if (!error || !error.message) {
                            error = { message: `${response.statusText} (${response.status})` };
                        }
                        throw error;
                    }).catch((error) => {
                        if (!error || !error.message) {
                            throw { message: error };
                        }
                        throw error;
                    });
                }
            }).catch((error) => {
                if (error.code !== 20 && error.name !== 'AbortError') { //aborted
                    if (this._status) {
                        this._status.error(error.message ? error.message : error);
                    }
                }
                return { ok: false, data: error }; //error
            });
        }
    }
}

export default DeployManager;