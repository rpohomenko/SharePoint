import * as React from 'react';
import { Label, IDropdownOption } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { isEqual } from '@microsoft/sp-lodash-subset';
import { FormMode, IContentType } from '../../../utilities/Entities';
import { IList } from '@pnp/sp/lists';
import { AsyncDropdown } from '../../components/asyncDropdown';
import { IContentTypeInfo } from '@pnp/sp/content-types/types';

export interface IContentTypeFieldRendererProps extends IBaseFieldRendererProps {
    list: IList;
}

export class ContentTypeFieldRenderer extends BaseFieldRenderer {

    private _ctField: React.RefObject<AsyncDropdown>;

    constructor(props: IContentTypeFieldRendererProps) {
        super(props);
        this._ctField = React.createRef();
    }

    public componentDidMount() {
        this.setValue(this.parseValue(this.props.defaultValue));
    }

    private parseValue(value: any): IContentType {
        const contentType = value as IContentTypeInfo;
        if (contentType) {
            return { Id: contentType.Id 
                ? typeof contentType.Id === "string" ? contentType.Id : contentType.Id.StringValue
                : null, Name: contentType.Name } as IContentType;
        }
        return null;
    }

    public componentDidUpdate(prevProps: IContentTypeFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (!isEqual(prevProps.defaultValue, this.props.defaultValue)) {
            this.componentDidMount();
        }
    }

    protected onRenderNewForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderEditForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderDispForm() {
        const { defaultValue } = this.props as IContentTypeFieldRendererProps;
        const contentType = defaultValue as IContentTypeInfo;
        return contentType && <Label>{contentType.Name}</Label>;
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled, list } = this.props as IContentTypeFieldRendererProps;
        const { value } = this.state;
        const contentType = value as IContentType;
        const contentTypeId = contentType ? contentType.Id : null;
        return list && <AsyncDropdown ref={this._ctField} disabled={disabled} placeholder={"Select a content type..."} options={() => this.loadContentTypes(list)}
            onChange={(option: IDropdownOption) => {
                if (option) {
                    this.setValue({ Id: option.key, Name: option.text } as IContentType);
                }
                else {
                    this.setValue(null);
                }
            }} selectedKey={contentTypeId} />;
    }

    private loadContentTypes(list: IList): Promise<IDropdownOption[]> {
        return new Promise<IDropdownOption[]>((resolve: (options: IDropdownOption[]) => void, reject: (error: any) => void) => {
            return list.contentTypes.filter('Hidden eq false').usingCaching().get()
                .then((contentTypes) => {
                    const options = contentTypes.map((ct) => ({ key: ct.Id.StringValue, text: ct.Name }) as IDropdownOption);
                    resolve(options);
                }).catch(e => {
                    reject(e.message);
                });
        });
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        const prevValue = this.parseValue(defaultValue);
        const currentValue: IContentType = this.getValue();
        return mode === FormMode.New ? this.hasValue() :
            (prevValue === null && currentValue !== null
                || prevValue !== null && currentValue === null
                || prevValue.Id !== currentValue.Id);
    }
}