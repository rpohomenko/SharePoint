import * as React from 'react';
import { TextField, ITextField, Label, Link } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { FormMode, IUrlFieldValue } from '../../../utilities/Entities';
import { isEqual } from '@microsoft/sp-lodash-subset';

export interface IUrlFieldRendererProps extends IBaseFieldRendererProps {
    asImage?: boolean;
}


export class UrlFieldRenderer extends BaseFieldRenderer {

    private _urlField: React.RefObject<ITextField>;
    private _urlDescField: React.RefObject<ITextField>;

    constructor(props: IUrlFieldRendererProps) {
        super(props);
        this._urlField = React.createRef();
        this._urlDescField = React.createRef();
    }


    public componentDidMount() {
        if (this.props.defaultValue) {
            this.setValue(this.props.defaultValue);
        }
    }

    public componentDidUpdate(prevProps: IUrlFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (!isEqual(prevProps.defaultValue, this.props.defaultValue)) {
            const currentValue = this.props.defaultValue as IUrlFieldValue;
            const prevValue = prevProps.defaultValue as IUrlFieldValue;
            if (prevValue && currentValue && prevValue.Url === currentValue.Url && prevValue.Description === currentValue.Description) {
               // nothing
            }
            else {
                this.componentDidMount();
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
        const { asImage } = this.props as IUrlFieldRendererProps;
        if (this.props.defaultValue) {
            const fieldValue = this.props.defaultValue as IUrlFieldValue;
            if (asImage === true) {
                return (<div onClick={() => {
                    window.open(fieldValue.Url, '_blank');
                }}><img src={fieldValue.Url} alt={fieldValue.Description || fieldValue.Url} /></div>);
            }
            else {
                return (<Link target={'_blank'} href={fieldValue.Url}>{fieldValue.Description || fieldValue.Url}</Link>);
            }
        }
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled } = this.props as IUrlFieldRendererProps;
        const { value } = this.state;
        const fieldValue = value as IUrlFieldValue;

        return <>
            <TextField underlined
                componentRef={this._urlField}
                disabled={disabled}
                onChange={(ev, newValue) => {
                    const urlValue = fieldValue ? { ...fieldValue, Url: newValue } : { Url: newValue };
                    this.setValue(urlValue);
                }}
                placeholder={"Type an URL ..."}
                value={!!fieldValue ? fieldValue.Url : ""}
            />
            <TextField underlined
                componentRef={this._urlDescField}
                disabled={disabled}
                multiline={true}
                onChange={(ev, newValue) => {
                    const urlValue = fieldValue ? { ...fieldValue, Description: newValue } : { Description: newValue };
                    this.setValue(urlValue);
                }}
                placeholder={"Type a description ..."}
                value={!!fieldValue ? fieldValue.Description : ""}
            />
        </>;
    } 

    public getValue(): IUrlFieldValue {
        const value = super.getValue() as IUrlFieldValue;
        if (value === undefined || value === null || !value.Url) {
            return null;
        }
        return { Url: value.Url, Description: value.Description } as IUrlFieldValue;
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        const currentValue = this.getValue() as IUrlFieldValue;
        const prevValue = (defaultValue || null) as IUrlFieldValue;
        return mode === FormMode.New ? this.hasValue() : (prevValue === null || (currentValue === null || prevValue.Url !== currentValue.Url || prevValue.Description !== currentValue.Description));
    }

}