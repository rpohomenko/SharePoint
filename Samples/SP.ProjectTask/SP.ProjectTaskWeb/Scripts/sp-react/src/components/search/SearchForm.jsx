import * as React from 'react';
import PropTypes from 'prop-types';
import { SearchField } from './SearchField';

export class SearchForm extends React.Component {

    constructor(props) {
        super(props);
        this._service = props.service;
        this._controllers = [];
        this.state = {
            ...props
        };

        this._container = React.createRef();
    }

    componentDidMount() {
        const { fields } = this.state;
        if (!fields) {
            this.setState({ fields: this._getFields() });
        }
    }

    render() {
        const { fields } = this.state;
        this._searchFields = null;
        if (fields) {
            return (
                <div className='search-container' ref={this._container}>
                    {fields.map((field, i) =>
                        (<SearchField ref={ref => {
                            if (ref != null) {
                                this._searchFields = this._searchFields || [];
                                this._searchFields.push(ref);
                            }
                        }}
                            key={field.key || field.name} fieldProps={field} onValidate={(fieldControl, isValid) => this._onValidate(fieldControl, isValid)} />))
                    }
                </div >
            );
        }
        return null;
    }

    _onValidate = (fieldControl, isValid) => {
        let isDirty = fieldControl.isDirty();
        if (this._searchFields && this._searchFields.length > 0) {
            for (let i = 0; i < this._searchFields.length; i++) {
                if (this._searchFields[i].getFormField() && fieldControl === this._searchFields[i].getFormField().getControl()) continue;
                if (this._searchFields[i].getFormField() && !this._searchFields[i].getFormField().isValid()) {
                    isValid = false;
                }
                if (this._searchFields[i].getFormField() && this._searchFields[i].getFormField().isDirty()) {
                    isDirty = true;
                }
            }
            const { onValidate } = this.props;
            if (this.isDirty() !== isDirty || this.isValid() !== isValid) {
                this.setState({ isValid: isValid, isDirty: isDirty }, () => {
                    if (typeof onValidate === "function") {
                        onValidate(this, isValid, isDirty);
                    }
                });
            }
        }
    }

    _getFields = () => {
        throw "Method _getFields is not yet implemented!";
    }

    validate(ignoreErrors) {
        let isValid = true;
        let isDirty = false;
        if (this._searchFields) {
            for (let i = 0; i < this._searchFields.length; i++) {
                if (this._searchFields[i].getFormField() && !this._searchFields[i].getFormField().validate(ignoreErrors)) {
                    isValid = false;
                }
                if (this._searchFields[i].getFormField() && this._searchFields[i].getFormField().isDirty()) {
                    isDirty = true;
                }
            }
        }
        return isValid && isDirty;
    }

    getSearchField(fieldName) {
        if (this._searchFields) {
            for (let i = 0; i < this._searchFields.length; i++) {
                if (this._searchFields[i].getFormField() && this._searchFields[i].getFormField().getFieldName() === fieldName) {
                    return this._searchFields[i];
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

    getFilter(appendOr) {
        let filter = null;
        if (this._getFields) {
            for (let i = 0; i < this._searchFields.length; i++) {
                let fieldFilter = this._searchFields[i].getFilter();
                if (fieldFilter) {
                    if (filter) {
                        filter += ` ${!!appendOr ? "||" : "&&"} ${fieldFilter}`;
                    }
                    else {
                        filter = `${fieldFilter}`;
                    }
                }
            }
        }
        return filter;
    }
}

SearchForm.propTypes = {

}

SearchForm.defaultProps = {

}

export default SearchForm;