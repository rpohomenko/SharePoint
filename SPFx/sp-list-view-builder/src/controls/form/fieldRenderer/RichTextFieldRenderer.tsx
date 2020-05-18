import * as React from 'react';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { FormMode } from '../../../utilities/Entities';
import { RichText, IRichTextState } from "@pnp/spfx-controls-react/lib/RichText";

export interface IRichTextFieldRendererProps extends IBaseFieldRendererProps {
  
}

export class RichTextFieldRenderer extends BaseFieldRenderer {

    private _richRextField: React.RefObject<RichText>;
    private _htmlValue: string;

    constructor(props: IRichTextFieldRendererProps) {
        super(props);
        this._richRextField = React.createRef();
    }


    public componentDidMount() {
        if (typeof this.props.defaultValue === "string") {
            this.setValue(this.props.defaultValue);
        }
    }

    public componentDidUpdate(prevProps: IRichTextFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (prevProps.defaultValue !== this.props.defaultValue) {
            if (typeof this.props.defaultValue === "string") {
                this.setValue(this.props.defaultValue);
            }
        }
    }

    protected onRenderNewForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderEditForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderDispForm() {
        return typeof this.props.defaultValue === "string" ? <div dangerouslySetInnerHTML={{ __html: this.props.defaultValue }} /> : null;
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled } = this.props as IRichTextFieldRendererProps;      
        return <RichText             
            ref={this._richRextField}
            isEditMode={!disabled}
            onChange={(value) => {
                this._htmlValue = value;
                this.validate().then(validationResult => {
                    this.onChange(value);
                });
                //this.setValue(newValue);
                return value;
            }}
            
            placeholder={typeof defaultValue === "string" ? "" : "Enter a text..."}
            value={this.getValue()}
        />;
    }   

    public hasValue() {
        return this.getValue() !== "" && super.hasValue();
    }

    public getValue() {
        const value = this._htmlValue;
        if (value === undefined || value === null || value === "") {
            return null;
        }
        return String(value);
    }

    public setValue(value: string) {
        this._htmlValue = value;
        super.setValue(value);
        if (this._richRextField.current) {
            const editor = this._richRextField.current.getEditor();
            if(editor){
                editor.pasteHTML(0, value);
            }
        }
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        return mode === FormMode.New ? this.hasValue() : (this.getValue() || "") !== (defaultValue || "");
    }

}