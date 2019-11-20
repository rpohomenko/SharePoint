import React from "react";
import PropTypes from 'prop-types';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TagPicker } from 'office-ui-fabric-react/lib/Pickers';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';

import { BaseFieldRenderer } from './BaseFieldRenderer';

export class LookupFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);
        this._picker = React.createRef();
    }

    componentDidMount() {
        //super.componentDidMount();      
    }

    _renderNewForm() {
        return this._renderNewOrEditForm();
    }

    _renderEditForm() {
        return this._renderNewOrEditForm();
    }

    _renderDispForm() {
        return (<Label>{this.props.value ? this.props.value.Value : ''}</Label>);
    }

    _renderNewOrEditForm() {
        let { fieldProps, disabled, headerText } = this.props;
        const { value, showPanel } = this.state;
        let items = []
        if (!fieldProps.isMultiple) {
            if (value) {
                items.push(value);
            }
        }
        else {
            items = value;
        }
        let listView = null;
        if (typeof fieldProps.getListView === "function") {
            listView = fieldProps.getListView(
            this._getCommandItems(),
            (selection) => {
                this.setState({ selection: selection });
            },            
            ()=>{
                this.setState({selection: null});
            },
            ()=>{
                this.setState({selection: null});
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
                    isOpen={showPanel}
                    isLightDismiss={true}
                    headerText={fieldProps.lookupList || headerText}
                    onDismiss={() => this._hidePanel()}
                    closeButtonAriaLabel="Close"
                    type={PanelType.medium}
                    onRenderFooterContent={this._onRenderFooterContent}
                    isFooterAtBottom={true}>
                    {listView}
                </Panel>)}
            <div className="input-group mb-3">
                <TagPicker componentRef={this._picker}
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
                <div className="input-group-append">
                    <DefaultButton  disabled={disabled} onClick={(e) => this._showPanel()}>...</DefaultButton>
                </div>
            </div>    </React.Fragment>);
    }

    _getCommandItems = ()=>{
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
                <DefaultButton onClick={() => this._hidePanel()}>Cancel</DefaultButton>
            </div>);
    }

    _onSelect = () => {
        let { fieldProps } = this.props;
        const { selection } = this.state;
        let items = selection.map((item) => { return { key: item.Id, name: item[fieldProps.lookupField || "Title"] } });
        this._onChange(items);
        this._hidePanel();
    }

    _showPanel = () => {
        const { showPanel } = this.state;
        if (!showPanel) {
            this.setState({ showPanel: true });
        }
    };

    _hidePanel = () => {
        const { showPanel } = this.state;
        if (showPanel) {
            this.setState({ showPanel: false, selection: null });
        }
    };

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