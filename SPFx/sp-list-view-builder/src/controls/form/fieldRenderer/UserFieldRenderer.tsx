import * as React from 'react';
import { NormalPeoplePicker, IBasePickerSuggestionsProps, IBasePicker, IPersonaProps, Label } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { PrincipalType, FormMode, IUserFieldValue } from '../../../utilities/Entities';
import SPService from '../../../utilities/SPService';
import { isEqual, uniqBy } from "@microsoft/sp-lodash-subset";
import { cancelable, CancelablePromise } from 'cancelable-promise';

interface CancelablePromise extends Promise<any> {
    cancel: () => void;
    finally: (onfinally?: (() => void) | undefined | null) => Promise<any>;
}

export interface IUserFieldRendererProps extends IBaseFieldRendererProps {
    suggestionsLimit?: number;
    resolveDelay?: number;
    selectionLimit?: number;
    minCharacters?: number;
    /**
   * Specify the user / group types to retrieve
   */
    principalTypes?: PrincipalType[];
}

export interface IUserFieldRendererState extends IBaseFieldRendererState {
    mostRecentlyUsedPersons?: IPersonaProps[];
}

export class UserFieldRenderer extends BaseFieldRenderer {

    private _promise: CancelablePromise;
    private _userField: React.RefObject<IBasePicker<IPersonaProps>>;

    constructor(props: IUserFieldRendererProps) {
        super(props);
        this._userField = React.createRef();
    }

    public componentDidMount() {
        if (this.props.defaultValue instanceof Array) {
            const value = this.props.defaultValue as IUserFieldValue[];
            const personas: IPersonaProps[] = value.map(v => {
                return {
                    id: String(v.Id),
                    imageUrl: this.getUserPhotoLink("", v.Email),
                    imageInitials: this.getFullNameInitials(v.Title),
                    text: v.Title,
                    secondaryText: v.Email,
                    tertiaryText: v.Name,
                    optionalText: "" // anything
                } as IPersonaProps;
            });
            this.setState({ mostRecentlyUsedPersons: [...personas] } as IUserFieldRendererState);
            this.setValue(personas);
        }
    }

    public componentDidUpdate(prevProps: IUserFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (!isEqual(prevProps.defaultValue, this.props.defaultValue)) {
            let prevValue = prevProps.defaultValue as IUserFieldValue[];
            let currentValue = this.props.defaultValue as IUserFieldValue[];
            if (currentValue instanceof Array && prevValue instanceof Array) {
                prevValue = prevValue.sort((a, b) => a.Id - b.Id);
                currentValue = currentValue.sort((a, b) => a.Id - b.Id);
            }
            if (!isEqual(prevValue, currentValue)) {
                this.componentDidMount();
            }
        }
    }

    public componentWillUnmount() {
        if (this._promise) {
            this._promise.cancel();
        }
    }

    protected onRenderNewForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderEditForm() {
        return this._renderNewOrEditForm();
    }

    protected onRenderDispForm() {
        const { defaultValue } = this.props as IUserFieldRendererProps;
        const userValues = defaultValue as IUserFieldValue[];
        return userValues instanceof Array && userValues.length > 0
            ? <>{userValues.map(userValue => <Label>{userValue.Title}</Label>)}</> : null;
    }

    private _renderNewOrEditForm() {
        const { disabled, suggestionsLimit, selectionLimit, resolveDelay } = this.props as IUserFieldRendererProps;
        const { value } = this.state;
        const items: IPersonaProps[] = value instanceof Array && value.length > 0 ? suggestionsLimit > 0 ? value.slice(0, suggestionsLimit) : value : [];
        const suggestionProps: IBasePickerSuggestionsProps = {
            suggestionsHeaderText: 'Suggested People',
            mostRecentlyUsedHeaderText: 'Suggested Contacts',
            noResultsFoundText: 'No results found',
            resultsMaximumNumber: suggestionsLimit ? suggestionsLimit : 5,
            loadingText: 'Loading',
            showRemoveButtons: true,
            suggestionsAvailableAlertText: 'People Picker Suggestions available',
            suggestionsContainerAriaLabel: 'Suggested contacts',
        };
        return <NormalPeoplePicker
            onResolveSuggestions={this.onFilterChanged.bind(this)}
            onEmptyInputFocus={this.returnMostRecentlyUsedPerson.bind(this)}
            getTextFromItem={(persona: IPersonaProps) => persona.text}
            className={'ms-PeoplePicker'}
            itemLimit={selectionLimit || 1}
            selectedItems={items}
            key={"peoplePicker"}
            pickerSuggestionsProps={suggestionProps}
            inputProps={{
                'aria-label': 'People Picker',
                placeholder: 'Enter a name or email address...'
            }}
            onItemSelected={(item: IPersonaProps): IPersonaProps | null => {
                if (this._userField.current && this.listContainsPersona(item, this._userField.current.items)) {
                    return null;
                }
                return item;
            }}
            componentRef={this._userField}
            resolveDelay={resolveDelay || 300}
            disabled={disabled}
            onChange={(items) => {
                this.setValue(items);
            }}
        />;
    }

    private async onFilterChanged(searchText: string, currentSelected: IPersonaProps[]): Promise<IPersonaProps[]> {
        const { suggestionsLimit, principalTypes, minCharacters } = this.props as IUserFieldRendererProps;
        if (searchText.length >= (minCharacters !== undefined ? minCharacters : 3)) {

            if (this._promise) {
                this._promise.cancel();
            }

            const users = await cancelable(SPService.searchPeople(searchText, suggestionsLimit, principalTypes, true))
                .finally(() => {
                    this._promise = null;
                });
            //const users = await SPService.findSiteUsers(searchText, suggestionsLimit, principalTypes) || [];
            if (users instanceof Array) {
                const personas: IPersonaProps[] = users.map(user => {
                    return {
                        id: String(user.Id),
                        imageUrl: this.getUserPhotoLink("", user.Email),
                        imageInitials: this.getFullNameInitials(user.Title),
                        text: user.Title,
                        secondaryText: user.Email,
                        tertiaryText: user.LoginName,
                        optionalText: "" // anything
                    } as IPersonaProps;
                });
                // Remove duplicates
                const { value, mostRecentlyUsedPersons } = this.state as IUserFieldRendererState;
                const filteredPersons = this.removeDuplicates(personas, value);
                // Add the users to the most recently used ones
                let recentlyUsed = mostRecentlyUsedPersons instanceof Array ? [...filteredPersons, ...mostRecentlyUsedPersons] : filteredPersons;
                recentlyUsed = uniqBy(recentlyUsed, "id");
                this.setState({
                    mostRecentlyUsedPersons: recentlyUsed.slice(0, suggestionsLimit)
                } as IUserFieldRendererState);
                return filteredPersons;
            }
        } else {
            return [];
        }
    }

    /**
  * Generates Initials from a full name
  */
    private getFullNameInitials(fullName: string): string {
        if (fullName === null) {
            return fullName;
        }

        const words: string[] = fullName.split(' ');
        if (words.length === 0) {
            return '';
        } else if (words.length === 1) {
            return words[0].charAt(0);
        } else {
            return (words[0].charAt(0) + words[1].charAt(0));
        }
    }



    /**
 * Returns the most recently used person
 *
 * @param currentPersonas
 */
    private returnMostRecentlyUsedPerson = (currentPersonas: IPersonaProps[]): IPersonaProps[] => {
        const { mostRecentlyUsedPersons } = this.state as IUserFieldRendererState;
        return this.removeDuplicates(mostRecentlyUsedPersons, currentPersonas);
    }


    /**
     * Removes duplicates
     *
     * @param personas
     * @param possibleDupes
     */
    private removeDuplicates = (personas: IPersonaProps[], possibleDupes: IPersonaProps[]): IPersonaProps[] => {
        return personas instanceof Array ? personas.filter(persona => !this.listContainsPersona(persona, possibleDupes)) : possibleDupes;
    }

    /**
    * Checks if list contains the person
    *
    * @param persona
    * @param personas
    */
    private listContainsPersona(persona: IPersonaProps, personas: IPersonaProps[]): boolean {
        if (!(personas instanceof Array) || personas.length === 0) {
            return false;
        }
        return personas.filter(item => item.id === persona.id).length > 0;
    }

    private getUserPhotoLink(siteUrl: string, accountName: string): string {
        return `${siteUrl}/_layouts/15/userphoto.aspx?accountname=${encodeURIComponent(accountName)}&size=S`;
    }

    public hasValue() {
        const value = this.getValue();
        return super.hasValue() && value instanceof Array && value.length > 0;
    }

    public getValue(): IUserFieldValue[] {
        const personas: IPersonaProps[] = this.state.value;
        if (personas instanceof Array) {
            return personas.map(persona => {
                const id = Number(persona.id);
                return { Id: isNaN(id) ? 0 : id, Title: persona.text, Email: persona.secondaryText, Name: persona.tertiaryText } as IUserFieldValue;
            }).filter(u => u.Id > 0);
        }
        return null;
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        if (mode === FormMode.New) {
            return this.hasValue();
        }
        else {
            let currentValue = this.getValue() as IUserFieldValue[];
            let prevValue = defaultValue as IUserFieldValue[];
            if (currentValue instanceof Array && prevValue instanceof Array) {
                if (currentValue.length !== prevValue.length) return true;
                currentValue = currentValue.sort((a, b) => a.Id - b.Id) as IUserFieldValue[];
                prevValue = prevValue.sort((a, b) => a.Id - b.Id) as IUserFieldValue[];
                for (let i = 0; i < currentValue.length; i++) {
                    if (currentValue[i].Id !== prevValue[i].Id) return true;
                    if (currentValue[i].Name !== prevValue[i].Name) return true;
                }
                return false;
            }
            if (!currentValue) {
                return !!prevValue;
            }
            if (!prevValue) {
                return !!currentValue;
            }
            return false;
        }
    }
}