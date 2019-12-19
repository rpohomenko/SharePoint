import * as React from 'react';
//import RichTextEditor from 'react-rte';
//import { EditorState, convertToRaw, ContentState } from 'draft-js';
//import { Editor } from 'react-draft-wysiwyg';
//import draftToHtml from 'draftjs-to-html';
//import htmlToDraft from 'html-to-draftjs';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
//import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { BaseFieldRenderer } from './BaseFieldRenderer';

export class RichTextFieldRenderer extends BaseFieldRenderer {
    constructor(props) {
        super(props);       
        this.state = {
            ...this.state,
            editorMode: 0,
            value: this.parseStringValue(props.currentValue)
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
                /*(<RichTextEditor
                    ref={ref => this._richTextField = ref}
                    value={value}
                    disabled={!!disabled}
                    onChange={(newValue) => {
                        this.setValue(newValue)
                    }}                  
                />)*/
                /*(<Editor
                    editorState={value}
                    wrapperClassName="rte-editor-wrapper"
                    editorClassName="rte-editor"
                    onEditorStateChange={(value)=>this.setValue(value)}
                />)*/
                ( <CKEditor
                    editor={ ClassicEditor }
                    data={value}
                    disabled={!!disabled}
                    onInit={ editor => {
                      
                    } }
                    onChange={ ( event, editor ) => {
                        const newValue = editor.getData();
                        this.setValue(newValue);
                    } }
                    onBlur={ ( event, editor ) => {
                       
                    } }
                    onFocus={ ( event, editor ) => {
                      
                    } }
                />)}
            {editorMode === 1 &&
                (<TextField
                    disabled={disabled}
                    multiline
                    onChange={(ev, newValue) => {
                        this.setValue(this.parseStringValue(newValue));
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
            //return draftToHtml(convertToRaw(value.getCurrentContent()));
            //return value.toString('html');
        }
        return value;
    }

    setValue(value) {        
        super.setValue(value);
    }

    parseStringValue(value) {
        return value;
        /*if (value) {
            value = htmlToDraft(value);
            if (value) {
                const contentState = ContentState.createFromBlockArray(value.contentBlocks);
                return EditorState.createWithContent(contentState);
            }
        }
        return "";*/
        /*return value
        ? RichTextEditor.createValueFromString(value, 'html')
        : RichTextEditor.createEmptyValue();*/
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