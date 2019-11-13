import * as React from 'react';
import { FormField } from './FormField';
//import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';

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

    componentDidUpdate() {
        const { mode } = this.state;
        if (mode === 2) {
            const { onValidate } = this.props;
            if (typeof onValidate === "function") {
                onValidate(this, this.isValid(), this.isDirty());
            }
        }
    }

    async componentWillUnmount() {
        await this._abort();
    }

    render() {
        const { isLoading, isSaving, mode, item, fields } = this.state;
        this._formFields = [];
        if (fields) {
            return (
                <div className='form-container'>
                    {
                        isLoading
                            ? (<Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}>
                                <ProgressIndicator label={"Loading..."} />
                            </Stack>)
                            : (<div>
                                {isSaving && (<Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}><ProgressIndicator label={"Saving..."} /> </Stack>)}
                                {fields.map((field, i) =>
                                    (<FormField ref={ref => {
                                        if (ref != null) {
                                            this._formFields.push(ref
                                            );
                                        }
                                    }
                                    } key={field.name} item={item} fieldProps={field} mode={mode} onValidate={this._onValidate} />))}
                            </div>)

                    }
                </div>
            );
        }
        return null;
    }

    async _abort() {
        if (this._controllers != null) {
            try {
                this._controllers.forEach(c => {
                    c.controller.abort();
                });
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

    _onValidate = (fieldControl, isValid, errors) => {
        const { onValidate } = this.props;
        if (typeof onValidate === "function") {
            let isDirty = fieldControl.isDirty();
            if (!isDirty && this._formFields) {
                for (let i = 0; i < this._formFields.length; i++) {
                    if (this._formFields[i].getControl() === fieldControl) continue;
                    if (this._formFields[i].isDirty()) {
                        isDirty = true;
                        break;
                    }
                }
            }
            if (!isValid && this._formFields) {
                for (let i = 0; i < this._formFields.length; i++) {
                    if (this._formFields[i].getControl() === fieldControl) continue;
                    if (this._formFields[i].isValid()) {
                        isValid = true;
                        break;
                    }
                }
            }
            onValidate(this, isValid, isDirty);
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
                    return 0; //error
                });
            }
            return response.json().then((item) => {
                if (item) {
                    this.setState({
                        item: item,
                        isLoading: false
                    });
                }
                return 1; // OK
            });
        });
    }

    isValid() {
        let isValid = true;
        if (this._formFields) {
            for (let i = 0; i < this._formFields.length; i++) {
                if (!this._formFields[i].isValid()) {
                    isValid = false;
                }
            }
        }
        return isValid;
    }

    isDirty() {
        let isDirty = false;
        if (this._formFields) {
            for (let i = 0; i < this._formFields.length; i++) {
                isDirty = this._formFields[i].isDirty();
                if (isDirty) break;
            }
        }
        return isDirty;
    }

    saveItem() {
        const { onValidate } = this.props;
        const { isLoading, mode, item } = this.state;
        if (!isLoading && mode > 0) {
            let newItem = {};

            if (!this.isValid()) {
                onValidate(this, false, this.isDirty());
                return;
            }

            if (this._formFields) {
                for (let i = 0; i < this._formFields.length; i++) {
                    this._formFields[i].onSaveHandler(newItem);
                }
            }

            this.setState({
                isSaving: true
            });

            if (item && mode === 1) {
                newItem.Id = item.Id;
                newItem.Version = item.Version;
            }
            let promise = this._saveDataAsync(newItem, null);
            return promise.then(response => {
                if (response.status === 400) {
                    return response.json().then((error) => {
                        alert(error.message);
                        this.setState({
                            isSaving: false
                        });
                        return 0; //error
                    });
                }
                return response.json().then((item) => {
                    if (item) {
                        this.setState({
                            item: item,
                            isSaving: false
                        });
                    }
                    return 1; // OK
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
}

export default ListForm;