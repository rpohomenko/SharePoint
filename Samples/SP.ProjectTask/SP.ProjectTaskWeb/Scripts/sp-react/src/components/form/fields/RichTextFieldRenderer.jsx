import * as React from 'react';
import RichTextEditor from 'react-rte';
//import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { isString } from 'util';

export class RichTextFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            editorMode: 0,
            value: props.currentValue
                ? RichTextEditor.createValueFromString(props.currentValue, 'html')
                : RichTextEditor.createEmptyValue()
        };
    }

    _renderNewForm() {
        return this._renderNewOrEditForm();
    }

    _renderEditForm() {
        return this._renderNewOrEditForm();
    }

    _renderDispForm() {
        return <div dangerouslySetInnerHTML={{ __html: this.props.currentValue }} />;
    }

    _renderNewOrEditForm() {
        const { disabled } = this.props;
        const { value, editorMode } = this.state;
        return (<>
            {this._getChoiceControl(editorMode)}
            {editorMode === 0 &&
                (<RichTextEditor
                    ref={ref => this._richTextField = ref}
                    value={value}
                    disabled={!!disabled}
                    onChange={(newValue) => {
                        this.setValue(newValue)
                    }}
                    customControls={[
                        //this._getChoiceControl(editorMode)
                        /*<Dropdown                                          
                            selectedKey={editorMode}
                            onChange={(ev, item) => this.setState({ editorMode: item.key })}
                            options={[{ key: 0, text: "Editor" }, { key: 1, text: "Source" }]}
                            disabled={disabled} />*/

                    ]}
                />)}
            {editorMode === 1 &&
                (<TextField
                    disabled={disabled}
                    multiline
                    onChange={(ev, newValue) => {
                        this.setValue(newValue);
                    }}
                    value={this.getValue()}
                />)}
        </>);
    }

    _getChoiceControl(editorMode) {
        return <ChoiceGroup
            selectedKey={editorMode}
            options={[
                {
                    key: 0,
                    text: <span>Editor &nbsp;</span>,
                    // iconProps : { iconName: "Edit" },
                    // imageSize : { width: 24, height: 24 }
                },
                {
                    key: 1,
                    text: <span>Source</span>,
                    // iconProps : { iconName: "Source" },
                    // imageSize : { width: 24, height: 24 }
                }
            ]}
            onChange={(ev, item) => this.setState({ editorMode: item.key })}
            styles={{
                flexContainer: {
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap'
                }
            }}
        />
    }

    _validate = () => {
        let { isValid, validationErrors } = {};
        isValid = true;
        return { isValid: isValid, validationErrors: validationErrors };
    }

    hasValue() {
        return this.getValue() !== "" && super.hasValue();
    }

    getValue() {
        let value = super.getValue();
        if (value) {
            return value.toString('html');
        }
        return value;
    }

    setValue(value) {
        if (isString(value)) {
            value = value
                ? RichTextEditor.createValueFromString(value, 'html')
                : RichTextEditor.createEmptyValue();
        }
        super.setValue(value);
    }

    isDirty() {
        const { currentValue } = this.props;
        if (super.isDirty()) {
            return this.getValue() !== currentValue;
        }
        return false;
    }
}

export default RichTextFieldRenderer;