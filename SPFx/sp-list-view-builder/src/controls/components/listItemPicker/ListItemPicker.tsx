import * as React from 'react';
import { TagPicker, IBasePicker, ITag, Label } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { IList } from "@pnp/sp/lists";
import "@pnp/sp/items";
import { IListItemPickerProps, IListItemPickerState } from './IListItemPickerProps';
import { IListItem, ILookupFieldValue } from '../../../utilities/Entities';
import { cancelable, CancelablePromise } from 'cancelable-promise';

interface CancelablePromise extends Promise<any> {
    cancel: () => void;
    finally: (onfinally?: (() => void) | undefined | null) => Promise<any>;
}

export class ListItemPicker extends React.Component<IListItemPickerProps, IListItemPickerState> {

    private _promise: CancelablePromise;

    private _picker = React.createRef<IBasePicker<ITag>>();

    constructor(props: IListItemPickerProps) {
        super(props);

        this.state = {

        };
    }

    /**
   * componentDidUpdate lifecycle hook
   * @param prevProps
   * @param prevState
   */
    public componentDidUpdate(prevProps: IListItemPickerProps, prevState: IListItemPickerState): void {

    }

    public componentWillUnmount() {
        if (this._promise) {
            this._promise.cancel();
        }
    }

    public render(): React.ReactElement {
        const { list, disabled, placeholder, itemLimit, selected, fieldName, minCharacters } = this.props;

        return <div>
            <Label>{this.props.label}</Label>
            <TagPicker
                itemLimit={itemLimit}
                removeButtonAriaLabel="Remove"
                componentRef={this._picker}
                selectedItems={selected instanceof Array ? selected.map((item: ILookupFieldValue) => {
                    return { key: item.Id, name: item.Title } as ITag;
                }) : []}
                onResolveSuggestions={(filter: string, selectedItems?: ITag[]) => {
                    if (!filter) return null;
                    if (filter.length < (minCharacters !== undefined ? minCharacters : 3)) return null;
                    if (this._promise) {
                        this._promise.cancel();
                    }
                    return this._promise = cancelable(this.getListItems(list, filter).then((items) => {
                        if (items instanceof Array) {
                            items = items.map(item => { return { ID: item.ID, Title: item[fieldName || "Title"] } as IListItem; });
                            if (this.props.onFilter instanceof Function) {
                                items = items.filter(item => this.props.onFilter(item));
                            }
                            return items.map(item => { return { key: item.ID, name: item.Title } as ITag; });
                        }
                    })).finally(() => {
                        this._promise = null;
                    });
                }}
                onChange={(items?: ITag[]) => {
                    if (this.props.onChange instanceof Function) {
                        const lookupValues = items instanceof Array ? items.map(item => { return { Id: Number(item.key), Title: item.name } as ILookupFieldValue; }) : null;
                        this.props.onChange(lookupValues);
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
                    suggestionsHeaderText: 'Suggested List Items',
                    noResultsFoundText: 'No items found'
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

    private getListItems(list: IList, search: string): Promise<IListItem[]> {
        const promise = new Promise<IListItem[]>((resolve: (items: IListItem[]) => void, reject: (error: any) => void) => {
            try {
                const filter = `substringof('${search}',${this.props.fieldName || "Title"})`;
                return list.items
                    .select('ID', this.props.fieldName || "Title")
                    .filter(filter)
                    .orderBy(this.props.fieldName || "Title")
                    .top(this.props.itemLimit || 30)
                    .usingCaching()
                    .get()
                    .then((items) => {
                        resolve(items);
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
