import * as React from 'react';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class SearchFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);
    }

    _renderNewForm() {
        return this._renderNewOrEditForm();
    }

    _renderEditForm() {
        return this._renderNewOrEditForm();
    }

    _renderDispForm() {
        return (<Label>{this.props.currentValue}</Label>);
    }

    _renderNewOrEditForm() {
        const { fieldProps, disabled, style } = this.props;
        const { value } = this.state;
        return (
            <SearchBox placeholder="Search..." style={style || { minWidth: '80px', width: '100px' }}
                disabled={disabled}
                onClear={() => {
                    this.setValue('');
                }}
                onChange={(ev, newValue) => {
                    this.setValue(newValue);
                }}
                value={value || ''}
                onSearch={(term) => {
                    if (typeof fieldProps.onSearch === "function") {
                        fieldProps.onSearch(term);
                    }
                }}
                underlined
                disableAnimation />
        );
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

export default SearchFieldRenderer;