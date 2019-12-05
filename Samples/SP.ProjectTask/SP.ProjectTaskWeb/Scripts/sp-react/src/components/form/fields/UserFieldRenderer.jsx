import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import {
    NormalPeoplePicker,
    ValidationState
} from 'office-ui-fabric-react/lib/Pickers';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { isArray } from 'util';

export class UserFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);

        let value = this.props.currentValue; 
        if (isArray(value)) {
            value = value.map(user => { return { key: user.Id, text: user.Value }; });
        }
        else{
            if(value){
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
        const { fieldProps, currentValue, disabled } = this.props;
        const { item, value } = this.state;
        const suggestionProps = {
            suggestionsHeaderText: fieldProps.suggestionsHeaderText || 'Suggested People',
            mostRecentlyUsedHeaderText: fieldProps.mostRecentlyUsedHeaderText || 'Suggested Contacts',
            noResultsFoundText: fieldProps.noResultsFoundText || 'No results found',
            loadingText: 'Loading',
            showRemoveButtons: false,
            suggestionsAvailableAlertText: fieldProps.suggestionsAvailableAlertText || 'People Picker Suggestions available',
            suggestionsContainerAriaLabel: fieldProps.suggestionsContainerAriaLabel || 'Suggested contacts'
        };
        return (
            <NormalPeoplePicker
                onResolveSuggestions={this._onFilterChanged}
                onEmptyInputFocus={this._returnMostRecentlyUsed}
                getTextFromItem={this._getTextFromItem}
                pickerSuggestionsProps={suggestionProps}
                className={'ms-PeoplePicker'}
                key={'normal'}
                onRemoveSuggestion={this._onRemoveSuggestion}
                onValidateInput={this._validateInput}
                removeButtonAriaLabel={''}
                inputProps={{
                }}
                componentRef={this._picker}
                onInputChange={this._onInputChange}
                resolveDelay={fieldProps.delay || 300}
                disabled={disabled}
                selectedItems={value}
                onChange={(items) => this._onChange(items)}
            />);
    }

    _onChange = (items) => {
        this.setValue(items);
    }

    _returnMostRecentlyUsed = (currentPersonas) => {
        let { mostRecentlyUsed } = this.state;
        //mostRecentlyUsed = this._removeDuplicates(mostRecentlyUsed, currentPersonas);
        return mostRecentlyUsed;
    };

    _getTextFromItem(persona) {
        return persona.text;
    }

    _onRemoveSuggestion = (item) => {

    };

    _validateInput = (input) => {
        if (input.indexOf('@') !== -1) {
            return ValidationState.valid;
        } else if (input.length > 1) {
            return ValidationState.warning;
        } else {
            return ValidationState.invalid;
        }
    };

    _onInputChange(input) {
        const outlookRegEx = /<.*>/g;
        const emailAddress = outlookRegEx.exec(input);
        if (emailAddress && emailAddress[0]) {
            return emailAddress[0].substring(1, emailAddress[0].length - 1);
        }
        return input;
    }

    _onFilterChanged = (
        filterText,
        currentPersonas,
        limitResults
    ) => {
        if (filterText) {
            return this._filterPersonasByText(filterText, limitResults);
        } else {
            return [];
        }
    };

    _filterPersonasByText = async (filterText, limitResults) => {
        const { fieldProps } = this.props;
        const { isLoading } = this.state;
        //if (isLoading) return null;
        this._abort();
        this.setState({
            isLoading: true
        });

        let controller = new AbortController();
        const promise = fieldProps.getUsers(filterText, { signal: controller.signal });
        this._controller = { controller: controller, promise: promise };

        return await this._onPromise(promise, (users) => {
            return users.map(user => {
                return {
                    key: user.Id,
                    imageUrl: user.ImageUrl,
                    //imageInitials: user.Initials,
                    text: user.Name,
                    secondaryText: user.Login,
                    tertiaryText: user.Email,
                    optionalText: user.IsSiteAdmin
                };
            });
        }).then((result) => {
            this.setState({
                isLoading: false
            });
            this._controller = null;
            return result;
        });
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

    _validate = () => {
        let { isValid, validationErrors } = {};
        isValid = true;
        return { isValid: isValid, validationErrors: validationErrors };
    }

    hasValue() {
        return this.getValue() !== "" && super.hasValue();
    }

}

export default UserFieldRenderer;