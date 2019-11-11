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

    render() {
        const { isLoading, mode, item, fields } = this.state;
        this._saveHandlers = [];
        if (fields) {
            return (
                <div className='form-container'>
                    {
                        isLoading
                            ? (<Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}><Spinner size={SpinnerSize.large} /></Stack>)
                            : (fields.map((field, i) => {
                                let formField;
                                let output = (<FormField ref={ref => formField = ref} key={field.name} item={item} fieldProps={field} mode={mode} />);
                                const saveHandler = (newItem) => {
                                    this._onSaveHandler(newItem, field, formField);
                                }
                                this._saveHandlers.push(saveHandler);
                                return output;
                            })
                            )}
                </div>
            );
        }
        return null;
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

        return promise.then(response => {
            if (response.status === 400) {
                return response.json().then((error) => {
                    alert(error.message);
                    this.setState({
                        isLoading: false
                    });
                    return 1; //error
                });
            }
            return response.json().then((item) => {
                if (item) {
                    this.setState({
                        item: item,
                        isLoading: false
                    });
                }
                return 0; // OK
            });
        });
    }

    saveItem() {
        const { isLoading, mode, item } = this.state;
        if (!isLoading && mode > 0) {
            let newItem = {};          
            this.setState({
                isLoading: true
            });

            for (let i = 0; i < this._saveHandlers.length; i++) {
                this._saveHandlers[i](newItem);
            }
           
            if(item && mode === 1){
                newItem.Id = item.Id;
                newItem.Version = item.Version;
            }
            let promise = this._saveDataAsync(newItem, null);
            return promise.then(response => {
                if (response.status === 400) {
                    return response.json().then((error) => {
                        alert(error.message);
                        this.setState({
                            isLoading: false
                        });
                        return 1; //error
                    });
                }
                return response.json().then((item) => {
                    if (item) {
                        this.setState({
                            item: item,
                            isLoading: false
                        });
                    }
                    return 0; // OK
                });
            });
        }
    }

    async saveItemAsync() {
        return await this.saveItem();
    }

    _fetchData = async (itemId, options) => {
        throw (`Method _fetchData is not yet implemented!`);
    }

    _fetchDataAsync = async (itemId, options) => {
        throw (`Method _fetchDataAsync is not yet implemented!`);
    }

    _saveData = async (item, options) => {
        throw (`Method _saveData is not yet implemented!`);
    }

    _saveDataAsync = async (item, options) => {
        throw (`Method _saveDataAsync is not yet implemented!`);
    }

    _getFields = () => {
        throw "Method _getFields is not yet implemented!";
    }

    _getCommandBar(mode) {
        switch (mode) {
            case 1:
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
            case 2:
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

    _onSaveHandler = (newItem, field, formField) => {     
        const fieldValue = formField.getFieldValue();
        if (newItem) {
            newItem[field.name] = fieldValue;
        }
    }
}

export default ListForm;