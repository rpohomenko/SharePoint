import React from "react";
import PropTypes from 'prop-types';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TagPicker } from 'office-ui-fabric-react/lib/Pickers';
import { DefaultButton, PrimaryButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { isArray, isNumber } from "util";

import { BaseFieldRenderer } from './BaseFieldRenderer';

export class LookupFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);
        let value = this.props.currentValue;
        if (isArray(value)) {
            value = value.map(user => { return { key: user.Id, name: user.Value }; });
        }
        else {
            if (value) {
                value = [{ key: value.Id, name: value.Value }];
            }
        }

        this.state = {
            ...this.state,
            value: value
        }

        this._picker = React.createRef();
        this._listForm = React.createRef();
        this._listView = React.createRef();
    }

    _renderNewForm() {
        return this._renderNewOrEditForm();
    }

    _renderEditForm() {
        return this._renderNewOrEditForm();
    }

    _renderDispForm() {
        const { fieldProps, currentValue } = this.props;
        if (currentValue) {
            let listForm = null;
            if (typeof fieldProps.renderListForm === "function") {
                listForm = fieldProps.renderListForm(this._listForm);
            }

            if (isArray(currentValue)) {
                return <>
                    {currentValue.map((lv, i) => (
                        <div key={`lookup_${i}`}><Label style={{ display: 'inline-block' }}><Link onClick={(e) => this._showForm(lv.Id)}>{lv ? lv.Value : ''}</Link></Label><br /></div>)
                    )}
                    {listForm}
                </>;
            }
            return (<>
                <div className="lookup-item">
                    <Label style={{ display: 'inline-block' }}><Link onClick={(e) => this._showForm(currentValue.Id)}>{currentValue.Value}</Link></Label>
                </div>
                {listForm}
            </>);
        }
        return null;
    }

    _renderNewOrEditForm() {
        let { fieldProps, disabled, headerText, itemLimit, resultsMaximumNumber, RESOLVE_DELAY, readonly } = this.props;
        const { value, showListView } = this.state;
        
        let listView = null;
        if (typeof fieldProps.renderListView === "function") {
            listView = fieldProps.renderListView(
                this._listView,
                this._getCommandItems(),
                (selection) => {
                    this.setState({ selection: selection });
                },
                () => {
                    this.setState({ selection: null });
                },
                () => {
                    this.setState({ selection: null });
                },
                null,
                null
            );
        }

        let defaultVisibleValue = isArray(value) && value.length > 0 ? "" : this._getPlaceholder();
        let isReadOnly = !isArray(value) || value.length === 0 ? true : readonly;
        return (<React.Fragment>
            {listView &&
                (<Panel
                    ref={ref => this._panel = ref}
                    isOpen={showListView}
                    isLightDismiss={true}
                    headerText={fieldProps.lookupList || headerText}
                    onDismiss={() => this._hideListView()}
                    closeButtonAriaLabel="Close"
                    type={PanelType.medium}
                    onRenderFooterContent={this._onRenderFooterContent}
                    isFooterAtBottom={true}>
                    {listView}
                </Panel>)}
            <Stack tokens={{ childrenGap: 2 }} horizontal>
                <TagPicker componentRef={this._picker}
                    onResolveSuggestions={this._onFilterChanged}
                    onEmptyInputFocus={this._returnMostRecentlyUsed}
                    onZeroQuerySuggestion={this._returnMostRecentlyUsed}
                    onRemoveSuggestion={this._onRemoveSuggestion}
                    selectedItems={value}
                    onChange={(items) => this._onChange(items)}
                    getTextFromItem={this._getTextFromItem}
                    pickerSuggestionsProps={{
                        suggestionsHeaderText: fieldProps.suggestionsHeaderText || 'Suggested Items',
                        noResultsFoundText: fieldProps.noResultsFoundText || 'No items found',
                        loadingText: 'Loading',
                        showRemoveButtons: false,
                        resultsMaximumNumber: fieldProps.limitResults || resultsMaximumNumber,
                    }}
                    resolveDelay={fieldProps.resolveDelay || RESOLVE_DELAY}
                    disabled={disabled}
                    itemLimit={fieldProps.isMultiple ? fieldProps.itemLimit || itemLimit : 1}
                    inputProps={{
                        ref: (ref) => this._input = ref,
                        disabled: true,
                        readOnly: isReadOnly,
                        onClick: (ev) => {
                            ev.target.readOnly = readonly;
                            ev.target.value = "";
                            ev.target.defaultValue = "";
                        
                            if (this._input) {
                                this._input._value = "";
                            }
                        },
                        onBlur: (ev) => {         
                            ev.target.readOnly =  true;
                            ev.target.defaultValue = defaultVisibleValue;
                            if (this._input) {
                                this._input._value = defaultVisibleValue;
                            }
                        },
                        onFocus: (ev) => {
                            ev.target.readOnly = readonly;
                            ev.target.value = "";
                            ev.target.defaultValue = "";
                            
                            if (this._input) {
                                this._input._value = "";
                            }
                        },
                        defaultVisibleValue: defaultVisibleValue,
                        "aria-label": defaultVisibleValue
                    }}
                />
                {listView && <IconButton iconProps={{ iconName: 'More' }} disabled={disabled} onClick={(e) => this._showListView()} />}
            </Stack>
        </React.Fragment>);
    }

    _returnMostRecentlyUsed = (currentItems) => {
        let { mostRecentlyUsed } = this.state;
        mostRecentlyUsed = this._removeDuplicates(mostRecentlyUsed, currentItems);
        return mostRecentlyUsed;
    };

    _removeDuplicates(items, possibleDupes) {
        return !!items ? items.filter((item) => !this._listContainsItem(item, possibleDupes)) : items;
    }

    _listContainsItem(currentItem, items) {
        return !!items && items.some((item) => item.key === currentItem.key);
    }

    _getTextFromItem(item) {
        return item.name;
    }

    _onRemoveSuggestion = (item) => {

    };

    _onFilterChanged = (
        filterText,
        currentItems,
        limitResults
    ) => {
        if (filterText) {
            return this._filterItemsByText(filterText, currentItems, limitResults);
        } else {
            return [];
        }
    };

    _filterItemsByText = async (filterText, currentItems, limitResults) => {
        const { fieldProps, resultsMaximumNumber, lookupField } = this.props;
        //const { isLoading } = this.state;
        //if (isLoading) return null;
        this._abort();
        this.setState({
            isLoading: true
        });

        limitResults = limitResults || fieldProps.limitResults || resultsMaximumNumber;

        if (typeof fieldProps.getItems === "function") {
            let controller = new AbortController();
            const promise = fieldProps.getItems(filterText, limitResults, { signal: controller.signal });
            this._controller = { controller: controller, promise: promise };

            return await this._onPromise(promise, (result) => {
                let items = result.items;
                let filteredItems = items.slice(0, limitResults > 0 ? limitResults : personas.length).map(item => {
                    return {
                        key: item.Id,
                        name: item[fieldProps.lookupField || lookupField]
                    };
                });

                filteredItems = this._removeDuplicates(filteredItems, currentItems);
                return filteredItems;
            }).then((result) => {
                this.setState({
                    isLoading: false
                });
                this._controller = null;
                return result;
            });
        }
        return null;
    }

    async _abort() {
        if (this._controller) {
            try {
                this.controller.abort();
            }
            catch{ }
            this._controller = null;
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

    _getPlaceholder = () => {
        const { fieldProps } = this.props;
        return fieldProps.isMultiple ? "Select options..." : "Select an option...";
    }

    _getCommandItems = () => {
        const { selection } = this.state;
        return [{
            key: 'selectItem',
            icon: 'MultiSelect',
            text: '',
            disabled: (!selection || selection.length === 0),
            onClick: (e, sender) => this._onSelect(),
            iconProps: {
                iconName: 'MultiSelect'
            },
            ariaLabel: 'Select Item(s)'
        }];
    }

    _onRenderFooterContent = () => {
        const { selection } = this.state;
        return (
            <div>
                <PrimaryButton onClick={() => this._onSelect()} disabled={!selection || selection.length === 0} style={{ marginRight: 7 }}>Select</PrimaryButton>
                <DefaultButton onClick={() => this._hideListView()}>Cancel</DefaultButton>
            </div>);
    }

    _onSelect = () => {
        let { fieldProps, lookupField } = this.props;
        const { selection, value } = this.state;

        let items = selection.map((item) => { return { key: item.Id, name: item[fieldProps.lookupField || lookupField] } });
        if (fieldProps.isMultiple) {
            if (isArray(value)) {
                items = this._removeDuplicates(items, value);
                items = value.concat(items);
            }
        }

        this._onChange(items);
        this._hideListView();
    }

    _showListView = () => {
        const { showListView } = this.state;
        if (!showListView) {
            this.setState({ showListView: true });
        }
    };

    _hideListView = () => {
        const { showListView } = this.state;
        if (showListView) {
            this.setState({ showListView: false, selection: null });
        }
    };

    _showForm = (itemId) => {
        if (this._listForm.current) {
            if (isNumber(itemId)) {
                this._listForm.current.setState({ itemId: itemId, item: undefined }, () => {
                    this._listForm.current.open(0);
                });
            }
        }
    }

    _onChange = (items) => {
        this.setValue(items);
        /*if (this._input) {
            let defaultVisibleValue = isArray(items) && items.length > 0 ? "" : this._getPlaceholder();
            this._input._value = defaultVisibleValue;
            this._input.setState({ displayValue: defaultVisibleValue });
        }*/
    }   

    _validate = () => {
        let { isValid, validationErrors } = {};
        isValid = true;
        return { isValid: isValid, validationErrors: validationErrors };
    }

    isDirty() {
        const { currentValue } = this.props;
        let value = this.getValue();
        if (super.isDirty()) {
            if (isArray(value) && isArray(currentValue)) {
                if (value.length !== currentValue.length) return true;
                let arr1 = value.sort((a, b) => a.Id - b.Id);
                let arr2 = currentValue.sort((a, b) => a.Id - b.Id);
                for (var i = 0; i < arr1.length; i++) {
                    if (arr1[i].Id !== arr2[i].Id) return true;
                }
                return false;
            }
            if (currentValue) {
                if (!value) return true;
                return currentValue.Id !== value.Id;
            }
            else if (value) {
                return true;
            }
            return true;
        }
        return false;
    }   

    getValue() {
        const { fieldProps } = this.props;
        let value = super.getValue();
        if (isArray(value)) {
            var items = value.map(item => { return { Id: item.key, Value: item.name } });
            if (!fieldProps.isMultiple) {
                return items.length > 0 ? items[0] : null;
            }
            return items;
        }
        return value ? { Id: value.key, Value: value.name } : null;
    }

    setValue(value) {
        super.setValue(value);
    }

    hasValue() {
        if (super.hasValue()) {
            let value = this.getValue();
            if (isArray(value)) {
                return value.filter(item => item.Id > 0).length > 0;
            }
            return value.Id > 0;
        }
        return false;
    }
}

LookupFieldRenderer.propTypes = {
    headerText: PropTypes.string,
    resultsMaximumNumber: PropTypes.number,
    RESOLVE_DELAY: PropTypes.number,
    itemLimit: PropTypes.number,
    lookupField: PropTypes.string
}

LookupFieldRenderer.defaultProps = {
    headerText: "Select...",
    resultsMaximumNumber: 10,
    RESOLVE_DELAY: 500,
    itemLimit: 10,
    lookupField: "Title"
}

export default LookupFieldRenderer;