import React from "react";
import PropTypes from 'prop-types';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { TagPicker } from 'office-ui-fabric-react/lib/Pickers';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { isArray, isNumber } from "util";

import { BaseFieldRenderer } from './BaseFieldRenderer';

export class LookupFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);
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

    /*_renderDispForm() {
        if(isArray(this.props.value)){
            return this.props.value.map((lv, i) => (<Label key={`lookup_${i}`}>{lv ? lv.Value : ''}</Label>));
        }
        return (<Label>{this.props.value ? this.props.value.Value : ''}</Label>);
    }*/

    _renderDispForm() {
        const { value, fieldProps } = this.props;
        if (value) {
            let listForm = null;
            if (typeof fieldProps.renderListForm === "function") {
                listForm = fieldProps.renderListForm(this._listForm);
            }

            if (isArray(value)) {
                return <>
                    {value.map((lv, i) => (
                        <><Label style={{display: 'inline-block'}} key={`lookup_${i}`}><Link onClick={(e) => this._showForm(lv.Id)}>{lv ? lv.Value : ''}</Link></Label><br/></>)
                    )}
                    {listForm}
                </>;
            }
            return (<>
                <div className="lookup-item">
                    <Label style={{display: 'inline-block'}}><Link onClick={(e) => this._showForm(value.Id)}>{value.Value}</Link></Label>
                </div>
                {listForm}
            </>);
        }
        return null;
    }

    _renderNewOrEditForm() {
        let { fieldProps, disabled, headerText } = this.props;
        const { value, showListView } = this.state;
        let items = []
        if (!fieldProps.isMultiple) {
            if (value) {
                items.push(value);
            }
        }
        else {
            if (isArray(value)) {
                items = value;
            }
        }
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

        items = items.map(item => { return { name: item.Value, key: item.Id } });
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
            <div className="input-group row">
                <TagPicker className="col-10" componentRef={this._picker}
                    onResolveSuggestions={() => { }}
                    selectedItems={items}
                    onChange={(items) => this._onChange(items)}
                    getTextFromItem={this._getTextFromItem}
                    pickerSuggestionsProps={{
                        suggestionsHeaderText: '',
                        noResultsFoundText: ''
                    }}
                    disabled={disabled}
                    inputProps={{
                        disabled: true,
                        readonly: true,
                        onClick: (ev) => {
                            ev.target.readOnly = true;
                        },
                        onBlur: (ev) => { },
                        onFocus: (ev) => {
                            ev.target.readOnly = true;
                        },
                        'aria-label': ''
                    }}
                />
                <div className="col-2">
                    <DefaultButton disabled={disabled} onClick={(e) => this._showListView()}>...</DefaultButton>
                </div>
            </div>    </React.Fragment>);
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
        let { fieldProps } = this.props;
        const { selection } = this.state;
        let items = selection.map((item) => { return { key: item.Id, name: item[fieldProps.lookupField || "Title"] } });
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
        const { fieldProps } = this.props;
        let value = items.map(item => { return { Id: item.key, Value: item.name } });
        if (!fieldProps.isMultiple) {
            value = value.length > 0 ? value[0] : null;
        }
        this.setValue(value);
    }

    _validate = () => {
        let { isValid, validationErrors } = {};
        isValid = true;
        return { isValid: isValid, validationErrors: validationErrors };
    }

    /*getValue() {
        return this.state.value ? this.state.value.Id : 0;
    }*/

    hasValue() {
        return this.getValue() && this.getValue().Id > 0 && super.hasValue();
    }
}

LookupFieldRenderer.propTypes = {
    headerText: PropTypes.string
}

LookupFieldRenderer.defaultProps = {
    headerText: "Select..."
}

export default LookupFieldRenderer;