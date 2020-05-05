import * as React from 'react';
import { Toggle, IToggle } from 'office-ui-fabric-react/lib/Toggle';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';

export interface IBooleanFieldRendererProps extends IBaseFieldRendererProps {

}

export class BooleanFieldRenderer extends BaseFieldRenderer {

    private _booleanField: React.RefObject<IToggle>;

    constructor(props: IBooleanFieldRendererProps) {
        super(props);
        this._booleanField = React.createRef();
    }


    public componentDidMount() {
        if (typeof this.props.defaultValue === "boolean") {          
            this.setValue(this.props.defaultValue);
        }
        else if (this.props.defaultValue === "0" || this.props.defaultValue === "1" || this.props.defaultValue === "false" || this.props.defaultValue === "true") {
            this.setValue(Boolean(this.props.defaultValue));
        }
    }

    public componentDidUpdate(prevProps: IBooleanFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (prevProps.defaultValue !== this.props.defaultValue) {
            if (typeof this.props.defaultValue === "boolean") {
                this.setValue(this.props.defaultValue);
            }
            else if (this.props.defaultValue === "0" || this.props.defaultValue === "1" || this.props.defaultValue === "false" || this.props.defaultValue === "true") {
                this.setValue(Boolean(this.props.defaultValue));
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
        if (typeof this.props.defaultValue === "boolean" || this.props.defaultValue === "0" || this.props.defaultValue === "1" || this.props.defaultValue === "false" || this.props.defaultValue === "true") {
            return <Label>{Boolean(this.props.defaultValue) === true ? "Yes" : "No"}</Label>;
        }
        return null;
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled } = this.props as IBooleanFieldRendererProps;
        const { value } = this.state;
        return <Toggle
            componentRef={this._booleanField}
            disabled={disabled}
            onText="Yes"
            offText="No"
            checked={value === true}
            onChange={(ev, checked?: boolean) => {
                this.setValue(checked);
            }} />;
    }

    public hasValue() {
        return super.hasValue();
    }
}