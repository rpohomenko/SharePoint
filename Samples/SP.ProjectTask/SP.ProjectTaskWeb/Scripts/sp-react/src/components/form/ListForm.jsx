import * as React from 'react';
import { FormField } from './FormField';
//import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { type } from 'os';

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
           return await this.loadItemAsync(itemId);
        }
    }   

    async componentWillUnmount() {
        return await this._abort();
    }

    render() {
        const { isLoading, isSaving, isDeleting, mode, item, fields, error } = this.state;
        this._formFields = [];
        if (fields) {
            return (
                <div className='form-container'>
                    <CommandBar ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                        items={this._getCommandItems()}
                        onRenderItem={this._onRenderCommandItem} />
                    {
                        error &&
                        (<MessageBar messageBarType={MessageBarType.error} isMultiline={false} onDismiss={() => {
                            this.setState({ error: undefined });
                        }} dismissButtonAriaLabel="Close">
                            {error.message}
                        </MessageBar>)
                    }
                    {
                        isLoading
                            ? (<Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}>
                                <ProgressIndicator label={"Loading..."} />
                            </Stack>)
                            : (<div>
                                {isSaving && (<Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}><ProgressIndicator label={"Saving..."} /></Stack>)}
                                {isDeleting && (<Stack horizontalAlign="start" styles={{ root: { padding: 10 } }}><ProgressIndicator label={"Deleting..."} /></Stack>)}
                                {fields.map((field, i) =>
                                    (<FormField ref={ref => {
                                        if (ref != null) {
                                            this._formFields.push(ref);
                                        }
                                    }} key={field.name} item={item} fieldProps={field} mode={mode} onValidate={this._onValidate} />))}
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

    _getCommandItems() {
        const { mode, item } = this.state;
        let items = [];
        if (mode === 0 && item) {
            items.push(
                {
                    key: 'editItem',
                    icon: 'Edit',
                    text: '',
                    onClick: (e, sender) => this.changeMode(1),
                    iconProps: {
                        iconName: 'Edit'
                    },
                    ariaLabel: 'Edit'
                });
            items.push(
                {
                    key: 'deleteItem',
                    icon: 'Delete',
                    text: '',
                    onClick: (e, sender) => {
                        this.deleteItemAsync();
                    },
                    iconProps: {
                        iconName: 'Delete'
                    },
                    ariaLabel: 'Delete'
                });
        }
        return items;
    }

    _onRenderCommandItem = (item) => {
        return (
            <CommandBarButton
                role="menuitem"
                aria-label={item.name}
                styles={{ root: { padding: '10px' } }}
                iconProps={{ iconName: item.icon }}
                onClick={item.onClick}
            />
        );
    };

    _onValidate = (fieldControl, isValid, isDirty) => {
        this._validate();
    }

    async loadItemAsync(itemId) {
        await this._abort();
        this._aborted = false;
        await this.loadItem(itemId);
    }

    loadItem(itemId) {
        if (this._aborted === true) return;

        this.setState({
            isLoading: true,
            error: undefined
        });

        let controller = new AbortController();
        const promise = this._fetchDataAsync(itemId, { signal: controller ? controller.signal : null });
        this._controllers.push({ controller: controller, promise: promise });

        return promise.then(response => {
            if (response.ok) {
                return response.json().then((item) => {
                    if (item) {
                        this.setState({
                            item: item,
                            isLoading: false
                        });
                    }
                    return 1; // OK
                });
            }
            else {
                return response.json().then((error) => {
                    if (!error || !error.message) {
                        error = { message: `${response.statusText} (${response.status})` };
                    }
                    this.setState({
                        error: error,
                        isSaving: false
                    });
                    return 0; //error
                }).catch(() => {
                    let error = { message: `${response.statusText} (${response.status})` };
                    this.setState({
                        error: error,
                        isSaving: false
                    });
                    return 0; //error
                });
            }
        }).catch((error) => {
            this.setState({
                error: error,
                isSaving: false
            });
        });
    }

    saveItem() {
        const { isLoading, mode, item, isValid, isDirty } = this.state;
        if (!isLoading && mode > 0) {
            let newItem = {};
            if (!isValid || !isDirty) {
                onValidate(this, isValid, isDirty);
                return;
            }

            if (this._formFields) {
                for (let i = 0; i < this._formFields.length; i++) {
                    this._formFields[i].onSaveHandler(newItem);
                }
            }

            this.setState({
                isSaving: true,
                error: undefined
            });

            if (item && mode === 1) {
                newItem.Id = item.Id;
                newItem.Version = item.Version;
                newItem.ContentTypeId = item.ContentTypeId
            }
            let promise = this._saveDataAsync(newItem, null);

            return promise.then(response => {
                if (response.ok) {
                    return response.json().then((item) => {
                        if (item) {
                            this.setState({
                                item: item,
                                isSaving: false
                            });
                        }
                        return 1; // OK
                    });
                }
                else {
                    return response.json().then((error) => {
                        if (!error || !error.message) {
                            error = { message: `${response.statusText} (${response.status})` };
                        }
                        this.setState({
                            error: error,
                            isSaving: false
                        });
                        return 0; //error
                    }).catch(() => {
                        let error = { message: `${response.statusText} (${response.status})` };
                        this.setState({
                            error: error,
                            isSaving: false
                        });
                        return 0; //error
                    });
                }
            }).catch((error) => {
                this.setState({
                    error: error,
                    isSaving: false
                });
            });
        }
    }

    async saveItemAsync() {
        let result = await this.saveItem();
        const { onItemSaved } = this.props;
        if (result === 1 && typeof (onItemSaved) === "function") {
            onItemSaved();
        }
        return result;
    }

    async deleteItemAsync() {
        let result = await this.deleteItem();
        const { onItemDeleted } = this.props;
        if (result === 1 && typeof (onItemDeleted) === "function") {
            onItemDeleted();
        }
        return result;
    }

    deleteItem() {
        const { isLoading, isDeleting, item } = this.state;
        if (!isLoading && !isDeleting && item) {
            this.setState({
                isDeleting: true,
                error: undefined
            });

            let promise = this._deleteItemAsync(item, null);

            return promise.then(response => {
                if (response.ok) {
                    return response.json().then((result) => {
                        this.setState({
                            isDeleting: false
                        });
                        return result ? 1 : 0;
                    });
                }
                else {
                    return response.json().then((error) => {
                        if (!error || !error.message) {
                            error = { message: `${response.statusText} (${response.status})` };
                        }
                        this.setState({
                            error: error,
                            isDeleting: false
                        });
                        return 0; //error
                    }).catch(() => {
                        let error = { message: `${response.statusText} (${response.status})` };
                        this.setState({
                            error: error,
                            isDeleting: false
                        });
                        return 0; //error
                    });
                }
            }).catch((error) => {
                this.setState({
                    error: error,
                    isDeleting: false
                });
            });
        }
    }

    _validate = () => {
        const { onValidate } = this.props;
        const isDirty = this.isDirty();
        const isValid = this.isValid();

        this.setState({ isValid: isValid, isDirty: isDirty });

        if (typeof onValidate === "function") {
            onValidate(this, isValid, isDirty);
        }

        return isValid && isDirty;
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

    _fetchDataAsync = async (itemId, options) => {
        throw (`Method _fetchDataAsync is not yet implemented!`);
    }

    _saveDataAsync = async (item, options) => {
        throw (`Method _saveDataAsync is not yet implemented!`);
    }

    _deleteItemAsync = async (item, options) => {
        throw (`Method _deleteItemAsync is not yet implemented!`);
    }

    _getFields = () => {
        throw "Method _getFields is not yet implemented!";
    }

    changeMode(mode) {
        const { onChangeMode } = this.props;
        this.setState({ mode: mode }, () => {
            if (typeof onChangeMode === "function") {
                onChangeMode(this, mode);
            }
        });
        if (mode > 0) {
            //this._validate();
        }
    }
}

export default ListForm;