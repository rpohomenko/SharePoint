import * as React from 'react';
import { FormField } from './FormField';
//import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
//import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { StatusBar } from '../StatusBar';
//import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
//import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { Callout } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';

export class ListForm extends React.Component {

    constructor(props) {
        super(props);
        this._service = props.service;
        this._controllers = [];
        this.state = {
            ...props
        };

        this._container = React.createRef();
        this._commandNode = React.createRef();
    }

    async componentDidMount() {
        const { item, itemId, mode, fields } = this.state;
        if (!fields) {
            this.setState({ fields: this._getFields() });
        }
        if (!item && mode < 2 && itemId > 0) {
            await this.loadItem(itemId);
        }
        this._validate(mode === 2, true);
    }

    async componentWillUnmount() {
        await this._abort();
    }

    render() {
        const { isLoading, mode, item, fields, confirmDeletion } = this.state;
        this._formFields = null;
        let _progressIndicator = this._getProgressIndicator();
        if (fields) {
            return (
                <div className='form-container' ref={this._container}>
                    <div ref={this._commandNode}>
                        <CommandBar ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                            items={this._getCommandItems()}
                            onRenderItem={this._onRenderCommandItem} />
                        <StatusBar ref={ref => this._status = ref} />
                        {_progressIndicator}
                    </div>
                    {
                        isLoading ? (<ProgressIndicator label={"Loading..."} />)
                            : fields.map((field, i) =>
                                (<FormField ref={ref => {
                                    if (ref != null) {
                                        let formFields = this._formFields = this._formFields || [];
                                        formFields.push(ref);
                                    }
                                }} key={field.name} item={item} fieldProps={field} mode={mode} onValidate={this._onValidate} />))
                    }
                    {confirmDeletion &&
                        (<Dialog
                            hidden={!confirmDeletion}
                            onDismiss={() => this.setState({ confirmDeletion: false })}
                            dialogContentProps={{
                                type: DialogType.normal,
                                title: 'Delete?',
                                subText: 'Are you sure you want to delete the item(s)?'
                            }}
                            modalProps={{
                                isBlocking: true,
                                styles: { main: { maxWidth: 450 } }
                            }}>
                            <DialogFooter>
                                <PrimaryButton onClick={() => {
                                    this.deleteItem();
                                    this.setState({ confirmDeletion: false });
                                }} text="Yes" />
                                <DefaultButton onClick={() => this.setState({ confirmDeletion: false })} text="No" />
                            </DialogFooter>
                        </Dialog>)
                    }
                </div>
            );
        }
        return null;
    }

    _getProgressIndicator() {
        const { isLoading, isSaving, isDeleting } = this.state;
        let label;
        /*if (isLoading) {
            label = "Loading...";
        }*/
        if (isSaving) {
            label = "Saving...";
        }
        else if (isDeleting) {
            label = "Deleting...";
        }
        if (label && this._commandNode.current) {
            return (
                <Callout
                    target={this._commandNode.current}
                    setInitialFocus={true}
                    gapSpace={0}
                    styles={{ root: { padding: '10px' } }}>
                    <ProgressIndicator label={label} />
                </Callout>
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
                        //this.deleteItem();
                        this.setState({ confirmDeletion: true });
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
        this._validate(isValid, isDirty);
    }

    async loadItem(itemId) {

        const { isLoading } = this.state;
        if (isLoading) return null;

        this.setState({
            isLoading: true
        });

        let controller = new AbortController();
        const promise = this._fetchData(itemId, { signal: controller.signal });
        this._controllers.push({ controller: controller, promise: promise });

        return await this._onPromise(promise, (item) => {
            if (item) {
                this.setState({
                    item: item
                });
                return { ok: true, data: item }; // OK
            }
            throw { message: `Cannot load the item with id=${itemId}.` };
        }).then((result) => {
            this.setState({
                isLoading: false
            });
            return result;
        });
    }

    async saveItem() {
        if (!this.validate()) return null;
        const { onItemSaved } = this.props;
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
                isSaving: true
            });

            if (item && mode === 1) {
                newItem.Id = item.Id;
                newItem.Version = item.Version;
                newItem.ContentTypeId = item.ContentTypeId
            }

            let controller = new AbortController();
            let promise = this._saveData(newItem, { signal: controller.signal });
            return await this._onPromise(promise, (item) => {
                if (item) {
                    this.setState({
                        item: item
                    }, () => {
                        if (typeof (onItemSaved) === "function") {
                            onItemSaved(this, item);
                        }
                    }
                    );
                    return { ok: true, data: item }; // OK
                }
                throw { message: `Cannot save the item with id=${itemId}.` };
            }).then((result) => {
                this.setState({
                    isSaving: false
                });
                return result;
            });
        }
    }

    async deleteItem() {
        const { onItemDeleted } = this.props;
        const { isLoading, isDeleting, item } = this.state;
        if (!isLoading && !isDeleting && item) {
            this.setState({
                isDeleting: true
            });

            let controller = new AbortController();
            let promise = this._deleteItem(item, { signal: controller.signal });

            return await this._onPromise(promise, (deleted) => {
                if (deleted) {
                    /* this.setState({
                         item: null
                     });*/
                    if (typeof (onItemDeleted) === "function") {
                        onItemDeleted(this, item);
                    }
                    return { ok: true, data: [item] }; // OK
                }
                throw { message: `Cannot delete the item with id=${itemId}.` };
            }).then((result) => {
                this.setState({
                    isDeleting: false
                });
                return result;
            });
        }
    }

    async _onPromise(promise, onSuccess) {
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

    _validate = (isValid, isDirty) => {
        const { onValidate } = this.props;
        this.setState({ isValid: isValid, isDirty: isDirty }, () => {
            if (typeof onValidate === "function") {
                onValidate(this, isValid, isDirty);
            }
        });
        return isValid && isDirty;
    }

    validate() {
        let isValid = true;
        if (this._formFields) {
            for (let i = 0; i < this._formFields.length; i++) {
                if (!this._formFields[i].validate()) {
                    isValid = false;
                }
            }
        }
        return isValid;
    }

    isValid() {
        let { isValid } = this.state;
        return isValid;
    }

    isDirty() {
        let { isDirty } = this.state;
        return isDirty;
    }

    _fetchData = (itemId, options) => {
        throw (`Method _fetchData is not yet implemented!`);
    }

    _saveData = (item, options) => {
        throw (`Method _saveData is not yet implemented!`);
    }

    _deleteItem = (item, options) => {
        throw (`Method _deleteItem is not yet implemented!`);
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
        if (mode === 2) {
            this._validate(true, true);
        }
    }
}

export default ListForm;