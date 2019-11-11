import * as React from 'react';
import { FormField } from './FormField';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

export class ListForm extends React.Component {

    constructor(props) {
        super(props);
        this._service = props.service;
        this._controllers = [];
        this.state = {
            ...props
        };
    }

    async componentDidMount() {
        const { item, itemId, mode, fields } = this.state;
        if (!fields) {
            this.setState({ fields: this._getFields() });
        }
        if (!item && mode < 2 && itemId > 0) {
            await this.loadItemAsync(itemId);
        }
    }

    async componentWillUnmount() {
        await this._abort();
    }

    async _abort() {
        if (this._controllers != null) {
            this._controllers.forEach(c => {
                c.controller.abort();
            });
            try {
                await this._waitAll()
            }
            catch{ }
            this._controllers = [];
            this._aborted = true;
        }
    }

    _waitAll = async () => {
        let promises = [];
        this._controllers.forEach(c => {
            promises.push(c.promise);
        });
        if (promises.length > 0) {
            return await Promise.all(promises);
        }
    }

    async loadItemAsync(itemId) {
        await this._abort();
        this._aborted = false;
        await this.loadItem(itemId);
    }

    loadItem(itemId) {
        if (this._aborted === true) return;

        this.setState({
            isLoading: true
        });

        let controller = new AbortController();
        const promise = this._fetchDataAsync(itemId, { signal: controller ? controller.signal : null });
        this._controllers.push({ controller: controller, promise: promise });

        return promise.then(response => response.json())
            .catch((error) => {
                if (error.code !== 20 && error.name !== 'AbortError') { //aborted
                    alert(error);
                }
            })
            .then((json) => {
                if (json) {
                    if (this._aborted === true) return;
                    if (this._controllers.filter(c => c.controller == controller) === 0) return;

                    this.setState({
                        item: json,
                        isLoading: false
                    });
                }
                this._controllers = this._controllers.filter(c => c.controller !== controller);
            })
            .catch((error) => {
                if (error.code !== 20 && error.name !== 'AbortError') { //aborted
                    alert(error);
                }
            });
    }

    _fetchData = async (itemId, options) => {
        throw (`Method _fetchData is not yet implemented!`);
    }

    _fetchDataAsync = async (itemId, options) => {
        throw (`Method _fetchDataAsync is not yet implemented!`);
    }

    render() {
        const { isLoading, mode, item, fields } = this.state;
        if (fields) {
            return (
                <div className='form-container'>
                    {
                        isLoading
                            ? (<Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}><Spinner size={SpinnerSize.large} /></Stack>)
                            : (fields.map((field, i) => (
                                <FormField key={field.name} item={item} fieldProps={field} mode={mode} />
                            ))
                            )}
                </div>
            );
        }
        return null;
    }

    _getFields = () => {
        throw "Method _getFields is not yet implemented!";
    }

    _getCommandBar(mode) {
        switch (mode) {
            case 0:
                return {
                    className: 'ms-bgColor-neutral',
                    key: 'edit',
                    name: 'Edit',
                    iconProps: {
                        iconName: 'Edit'
                    },
                    onClick: (ev) => {
                        ev.preventDefault();
                    }
                };
            case 1:
                return {
                    className: 'ms-bgColor-neutral',
                    key: 'save',
                    name: 'Save',
                    iconProps: {
                        iconName: 'Save'
                    },
                    onClick: (ev) => {
                        ev.preventDefault();
                        const isValid = false;
                        if (isValid) {

                        } else {

                        }
                    }
                };
        }
    }
}

export default ListForm;