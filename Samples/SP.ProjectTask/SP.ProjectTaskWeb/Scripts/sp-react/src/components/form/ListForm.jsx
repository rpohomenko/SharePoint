import * as React from 'react';
import PropTypes from 'prop-types';
//import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
//import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
//import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
//import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
//import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { Callout } from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { isArray } from 'util';

import { FormField } from './fields/FormField';
import { StatusBar } from '../StatusBar';

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
        if (mode === 2 || mode === 1) {
            //this._validate(true, false);
            this.validate(true);
        }
    }

    async componentWillUnmount() {
        await this._abort();
    }

    render() {
        const { commandItems } = this.props;
        const { isLoading, mode, item, fields, confirmDeletion, isDeleting, isSaving, onRenderCommandBar } = this.state;
        this._formFields = null;
        if (fields) {
            let _progressIndicator = this._getProgressIndicator();
            let commandBar;
            if (typeof onRenderCommandBar === "function") {
                commandBar = onRenderCommandBar(isArray(commandItems) ? commandItems : /*this._getCommandItems()*/[], this._onRenderCommandItem);
            }
            else {
                /* commandBar = (<CommandBar ref={ref => this._commandBar = ref} styles={{ root: { paddingTop: 10 }, menuIcon: { fontSize: '16px' } }}
                     items={isArray(commandItems) ? commandItems : this._getCommandItems()}
                     onRenderItem={this._onRenderCommandItem} />);*/
            }
            return (
                <div className='form-container' ref={this._container}>
                    <div ref={this._commandNode}>
                        {commandBar}
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
                                }} disabled={isLoading || isDeleting || isSaving} key={field.key || field.name} item={item} fieldProps={field} mode={mode} onValidate={(fieldControl, isValid, isDirty) => this._onValidate(fieldControl, isValid, isDirty)} />))
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
                </div >
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

    /* _getCommandItems() {
          const { mode, item, isDeleting, isSaving, isValid, isDirty } = this.state;
          let items = [];
  
          if (item && mode === 0) {
              items.push(
                  {
                      key: 'editItem',
                      icon: 'Edit',
                      text: '',
                      disabled: isDeleting,
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
                      disabled: isDeleting || isSaving,
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
          else if (mode === 2 || (item && mode === 1)) {
              items.push(
                  {
                      key: 'saveItem',
                      icon: 'Save',
                      text: '',
                      disabled: isDeleting || isSaving || !(isValid && isDirty),
                      onClick: (e, sender) => {
                          this.saveItem();
                      },
                      iconProps: {
                          iconName: 'Save'
                      },
                      ariaLabel: 'Save'
                  });
          }
  
          return items;
      }*/

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
        if (this._formFields && this._formFields.length > 0) {
            for (let i = 0; i < this._formFields.length; i++) {
                if (fieldControl === this._formFields[i].getControl()) continue;
                if (!this._formFields[i].isValid()) {
                    isValid = false;
                }
                if (this._formFields[i].isDirty()) {
                    isDirty = true;
                }
            }
            this._validate(isValid, isDirty);
        }
    }

    async loadItem(itemId) {
        const { onItemLoaded } = this.props;
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
                }, () => {
                    if (typeof onItemLoaded === "function") {
                        onItemLoaded(this, item);
                    }
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
        const { onSaved, onSaving } = this.props;
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
            }, () => {
                if (typeof (onSaving) === "function") {
                    onSaving(this, item);
                }
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
                        if (typeof (onSaved) === "function") {
                            onSaved(this, item);
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
        const { onDeleted } = this.props;
        const { isLoading, isDeleting, onDeleting, item } = this.state;
        if (!isLoading && !isDeleting && item) {
            this.setState({
                isDeleting: true
            },
                () => {
                    if (typeof onDeleting === "function") {
                        onDeleting(this, item);
                    }
                });

            let controller = new AbortController();
            let promise = this._deleteItem(item, { signal: controller.signal });

            return await this._onPromise(promise, (deleted) => {
                if (deleted) {
                    this.setState({
                        item: null
                    }, () => {
                        if (typeof (onDeleted) === "function") {
                            onDeleted(this, item);
                        }
                    });
                    return { ok: true, data: [item] }; // OK
                }
                throw { message: `Cannot delete the item with id=${item.Id}.` };
            }).then((result) => {
                this.setState({
                    isDeleting: false
                }, () => {
                    if (typeof (onDeleted) === "function") {
                        onDeleted(this, false);
                    }
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

    validate(ignoreErrors) {
        let isValid = true;
        let isDirty = false;
        if (this._formFields) {
            for (let i = 0; i < this._formFields.length; i++) {
                if (!this._formFields[i].validate(ignoreErrors)) {
                    isValid = false;
                }
                if (this._formFields[i].isDirty()) {
                    isDirty = true;
                }
            }
        }
        return isValid && isDirty;
    }

    getFieldForm(fieldName) {
        if (this._formFields) {
            for (let i = 0; i < this._formFields.length; i++) {
                if (this._formFields[i].getFieldName() === fieldName) {
                    return this._formFields[i];
                }
            }
        }
        return null;
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

    changeMode(changedMode) {
        const { onChangeMode } = this.props;
        const { mode } = this.state;
        if (mode !== changedMode) {
            this.setState({ mode: changedMode }, () => {
                if (changedMode === 2 || changedMode === 1) {
                    //this._validate(true, false);
                    this.validate(true);
                }
                if (typeof onChangeMode === "function") {
                    onChangeMode(this, changedMode);
                }
            });
        }
    }
}

ListForm.propTypes = {
    STATUS_TIMEOUT: PropTypes.number
}

ListForm.defaultProps = {
    STATUS_TIMEOUT: 5000
}

export default ListForm;