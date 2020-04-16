import * as React from 'react';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TagPicker, IBasePicker, ITag } from 'office-ui-fabric-react/lib/Pickers';
import { IList } from "@pnp/sp/lists";
import { IFieldInfo } from "@pnp/sp/fields";
import { IFieldPickerState, IFieldPickerProps } from './IFieldPickerProps';
import { IField } from "../../../utilities/Entities";

export class FieldPicker extends React.Component<IFieldPickerProps, IFieldPickerState> {

    private _picker = React.createRef<IBasePicker<ITag>>();
    private _fields: IFieldInfo[];

    constructor(props: IFieldPickerProps) {
        super(props);

        this.state = {

        };
    }

    /**
   * componentDidUpdate lifecycle hook
   * @param prevProps
   * @param prevState
   */
    public componentDidUpdate(prevProps: IFieldPickerProps, prevState: IFieldPickerState): void {
        if (prevProps.list !== this.props.list) {
            this._fields = undefined;
        }
    }

    public render(): React.ReactElement {
        const { list, disabled, placeholder, itemLimit, selected } = this.props;

        return <div>
            <Label>{this.props.label}</Label>
            <TagPicker
                itemLimit={itemLimit}
                removeButtonAriaLabel="Remove"
                componentRef={this._picker}
                selectedItems={selected instanceof Array ? selected.map((field) => {
                    return { key: field.Name, name: field.Title } as ITag;
                }) : []}
                onResolveSuggestions={(filter: string, selectedItems?: ITag[]) => {
                    if(!filter) return null;
                    return this.getFields(list).then((fields) => {
                        if (fields instanceof Array) {
                            return fields.filter(field => field.Title.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
                                .map(field => { return { key: field.InternalName, name: field.Title } as ITag; });
                        }
                    });
                }}
                onChange={(items?: ITag[]) => {
                    const fields = items.length > 0 && this._fields instanceof Array ? this._fields.filter(field => items.some(item => item.key === field.InternalName)) : [];
                    if (this.props.onChange instanceof Function) {
                        this.props.onChange(fields.map(field => { return { Id: field.Id, Name: field.InternalName, Title: field.Title } as IField; }));
                    }
                }}
                onItemSelected={(item: ITag): ITag | null => {
                    if (this._picker.current && this._listContainsTag(item, this._picker.current.items)) {
                        return null;
                    }
                    return item;
                }}
                getTextFromItem={(item: ITag) => {
                    return item.name;
                }}
                inputProps={{
                    disabled: disabled,
                    readOnly: false,
                    placeholder: placeholder,
                    "aria-label": placeholder
                }}
                pickerSuggestionsProps={{
                    suggestionsHeaderText: 'Suggested Fields',
                    noResultsFoundText: 'No fields found'
                }}
                disabled={disabled}
            />
        </div>;
    }

    private _listContainsTag(tag: ITag, tagList?: ITag[]) {
        if (!tagList || !tagList.length || tagList.length === 0) {
            return false;
        }
        return tagList.filter(compareTag => compareTag.key === tag.key).length > 0;
    }

    private getFields(list: IList): Promise<IFieldInfo[]> {
        const promise = new Promise<IFieldInfo[]>((resolve: (fields: IFieldInfo[]) => void, reject: (error: any) => void) => {
            if (this._fields instanceof Array) {
                resolve(this._fields);
                return;
            }
            try {
                const specificFieldNames = ["ID", "Title", "Created", "Modified", "Author", "Editor"];
                return list.fields
                    .select('Id', 'InternalName', 'EntityPropertyName', 'Title', 'FieldTypeKind', 'AllowMultipleValues', 'RichText', 'DisplayFormat', 'LookupField', 'LookupList', 'LookupWebId', 'IsRelationship', 'PrimaryFieldId')
                    .filter(`(${specificFieldNames.map(field => `InternalName eq '${field}'`).join(' or ')}) or (ReadOnlyField eq false and Hidden eq false)`)
                    .orderBy("Title")
                    .usingCaching()
                    .get()
                    .then((fields) => {
                        this._fields = fields;
                        resolve(fields);
                    }).catch(e => {
                        reject(e.message);
                    });
            }
            catch (e) {
                reject(e.message);
            }
        });
        return promise;
    }
}
