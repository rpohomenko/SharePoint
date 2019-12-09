import * as React from 'react';
import PropTypes from 'prop-types';
//import { Label } from 'office-ui-fabric-react/lib/Label';
import {
    NormalPeoplePicker,
    ValidationState
} from 'office-ui-fabric-react/lib/Pickers';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { isArray } from 'util';
//var URI = require('urijs');

//URI.noConflict();

export class UserFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);

        let value = this.props.currentValue;
        if (isArray(value)) {
            value = value.map(user => { return { key: user.Id, text: user.Value }; });
        }
        else {
            if (value) {
                value = [{ key: value.Id, text: value.Value }];
            }
        }

        this.state = {
            ...this.state,
            value: value
        }
    }

    _renderNewForm() {
        return this._renderNewOrEditForm();
    }

    _renderEditForm() {
        return this._renderNewOrEditForm();
    }

    _renderDispForm() {
        const { currentValue } = this.props;
        if (isArray(currentValue)) {
            return currentValue.map((user, i) => (<span key={`user_${i}`}>{i > 0 ? ', ' : ''}{user.Value}</span>));
        }
        return (<span>{currentValue ? currentValue.Value : ''}</span>);
    }

    _renderNewOrEditForm() {
        const { fieldProps, currentValue, disabled, resultsMaximumNumber, RESOLVE_DELAY, itemLimit, readonly } = this.props;
        const { item, value } = this.state;
        const suggestionProps = {
            suggestionsHeaderText: fieldProps.suggestionsHeaderText || 'Suggested People',
            mostRecentlyUsedHeaderText: fieldProps.mostRecentlyUsedHeaderText || 'Suggested Contacts',
            noResultsFoundText: fieldProps.noResultsFoundText || 'No results found',
            loadingText: 'Loading',
            showRemoveButtons: false,
            resultsMaximumNumber: fieldProps.limitResults || resultsMaximumNumber,
            suggestionsAvailableAlertText: fieldProps.suggestionsAvailableAlertText || 'People Picker Suggestions available',
            suggestionsContainerAriaLabel: fieldProps.suggestionsContainerAriaLabel || 'Suggested contacts'
        };
        let defaultVisibleValue = isArray(value) && value.length > 0 ? "" : this._getPlaceholder();
        return (
            <NormalPeoplePicker
                onResolveSuggestions={this._onFilterChanged}
                onEmptyInputFocus={this._returnMostRecentlyUsed}
                onZeroQuerySuggestion={this._returnMostRecentlyUsed}
                getTextFromItem={this._getTextFromItem}
                pickerSuggestionsProps={suggestionProps}
                className={'ms-PeoplePicker'}
                key={'normal'}
                onRemoveSuggestion={this._onRemoveSuggestion}
                onValidateInput={this._validateInput}
                removeButtonAriaLabel={''}
                inputProps={{
                    ref: (ref) => this._input = ref,
                    disabled: true,
                    readOnly: readonly,
                    onClick: (ev) => {
                        
                    },
                    onBlur: (ev) => {         
                       
                    },
                    onFocus: (ev) => {
                      
                    },
                    placeholder: defaultVisibleValue,
                    //defaultVisibleValue: defaultVisibleValue,
                    "aria-label": defaultVisibleValue
                }}
                componentRef={this._picker}
                onInputChange={this._onInputChange}
                resolveDelay={fieldProps.resolveDelay || RESOLVE_DELAY}
                itemLimit={fieldProps.isMultiple ? fieldProps.itemLimit || itemLimit : 1}
                disabled={disabled}
                selectedItems={value}
                onChange={(items) => this._onChange(items)}
            />);
    }

    _getPlaceholder = () => {
        const { fieldProps } = this.props;
        return fieldProps.isMultiple ? "Enter a name or email address..." : "Enter a name or email address...";
    }

    _onChange = (items) => {
        this.setValue(items);       
    }

    _returnMostRecentlyUsed = (currentPersonas) => {
        let { mostRecentlyUsed } = this.state;
        mostRecentlyUsed = this._removeDuplicates(mostRecentlyUsed, currentPersonas);
        return mostRecentlyUsed;
    };

    _removeDuplicates(personas, possibleDupes) {
        return !!personas ? personas.filter((persona) => !this._listContainsPersona(persona, possibleDupes)) : personas;
    }

    _listContainsPersona(persona, personas) {
        return !!personas && personas.some((item) => item.key === persona.key);
    }

    _getTextFromItem(persona) {
        return persona.text;
    }

    _onRemoveSuggestion = (item) => {

    };

    _validateInput = (value) => {
        /*if (value.indexOf('@') !== -1) {
            return ValidationState.valid;
        } else if (value.length > 1) {
            return ValidationState.warning;
        } else {
            return ValidationState.invalid;
        }*/
        return ValidationState.valid;
    };

    _onInputChange(value) {
        /*const outlookRegEx = /<.*>/g;
        const emailAddress = outlookRegEx.exec(value);
        if (emailAddress && emailAddress[0]) {
            return emailAddress[0].substring(1, emailAddress[0].length - 1);
        }*/
        return value;
    }

    _onFilterChanged = (
        filterText,
        currentPersonas,
        limitResults
    ) => {
        if (filterText) {
            return this._filterPersonasByText(filterText, currentPersonas, limitResults);
        } else {
            return [];
        }
    };

    _filterPersonasByText = async (filterText, currentPersonas, limitResults) => {
        const { fieldProps, resultsMaximumNumber } = this.props;
        //const { isLoading } = this.state;
        //if (isLoading) return null;
        this._abort();
        this.setState({
            isLoading: true
        });

        limitResults = limitResults || fieldProps.limitResults || resultsMaximumNumber;

        if (typeof fieldProps.getPersonas === "function") {
            let controller = new AbortController();
            const promise = fieldProps.getPersonas(filterText, limitResults, { signal: controller.signal });
            this._controller = { controller: controller, promise: promise };

            return await this._onPromise(promise, (personas) => {
                this._personas = personas;
                let filteredPersonas = personas.slice(0, limitResults > 0 ? limitResults : personas.length).map(persona => {
                    /*persona.ImageUrl = persona.ImageUrl
                    ? new URI(persona.ImageUrl || "", _spPageContextInfo.BASE_PATH || "").toString()
                    : '';*/
                    return {
                        key: persona.Id,
                        //imageUrl: persona.ImageUrl,
                        //imageInitials: persona.Initials,
                        text: persona.Name,
                        secondaryText: persona.Email,
                        tertiaryText: persona.Login,
                        //optionalText: persona.IsSiteAdmin
                    };
                });

                filteredPersonas = this._removeDuplicates(filteredPersonas, currentPersonas);
                return filteredPersonas;
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

    getPersonaById(id) {
        if (id > 0 && isArray(this._personas)) {
            let found = this._personas.filter(persona => persona.Id === id);
            if (found.length > 0) {
                return found[0];
            }
        }
        return null;
    }

    _validate = () => {
        let { isValid, validationErrors } = {};
        isValid = true;
        return { isValid: isValid, validationErrors: validationErrors };
    }

    getValue() {
        const { fieldProps } = this.props;
        let value = super.getValue();
        if (isArray(value)) {
            var users = value.map(user => { return { Id: user.key, Value: user.text } });
            if (!fieldProps.isMultiple) {
                return users.length > 0 ? users[0] : null;
            }
            return users;
        }
        return value ? { Id: value.key, Value: value.text } : null;
    }

    setValue(value) {
        super.setValue(value);
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

UserFieldRenderer.propTypes = {
    resultsMaximumNumber: PropTypes.number,
    RESOLVE_DELAY: PropTypes.number,
    itemLimit: PropTypes.number
}

UserFieldRenderer.defaultProps = {
    resultsMaximumNumber: 10,
    RESOLVE_DELAY: 500,
    itemLimit: 10
}


export default UserFieldRenderer;