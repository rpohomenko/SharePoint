import * as React from 'react';
import PropTypes from 'prop-types';
import { SearchField } from './SearchField';
import { isArray } from 'util';

export class SearchForm extends React.Component {

    constructor(props) {
        super(props);
        this._service = props.service;
        this._controllers = [];
        this.state = {
            ...props,
            isDirty: true
        };

        this._container = React.createRef();
    }

    componentDidMount() {
        this.validate();
    }

    render() {
        let { fields } = this.props;
        const { isDirty } = this.state;
        if (!fields || !isArray(fields)) {
            fields = this._getFields();
        }
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
                            key={field.key || field.name}
                            fieldProps={field}
                            isDirty={isDirty}
                            onValidate={(fieldControl, isValid) => this._onValidate(fieldControl, isValid)} />))
                    }
                </div >
            );
        }
        return null;
    }

    _onValidate = (fieldControl, isValid) => {
        let isDirty = true;//fieldControl.isDirty();
        if (!isDirty && this._searchFields && this._searchFields.length > 0) {
            for (let i = 0; i < this._searchFields.length; i++) {
                //if (this._searchFields[i].getFormField() && fieldControl === this._searchFields[i].getFormField().getControl()) continue;
                if (this._searchFields[i].getFormField() && !this._searchFields[i].getFormField().isValid()) {
                    isValid = false;
                }
                if ((this._searchFields[i].getComparison() === 8 || this._searchFields[i].getComparison() === 9)
                    || (this._searchFields[i].getFormField() && this._searchFields[i].getFormField().isDirty())) {
                    isDirty = true;
                }
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
        let filter = { fields: [], expr: null };
        if (this._searchFields) {
            for (let i = 0; i < this._searchFields.length; i++) {
                const fieldFilter = {
                    props: this._searchFields[i].getFieldProps(),
                    expr: this._searchFields[i].getFilterExpr()
                }

                if (fieldFilter.props) {
                    filter.fields.push(fieldFilter);
                }

                if (fieldFilter.expr) {
                    if (filter.expr) {
                        filter.expr += ` ${!!appendOr ? "||" : "&&"} ${fieldFilter.expr}`;
                    }
                    else {
                        filter.expr = `${fieldFilter.expr}`;
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