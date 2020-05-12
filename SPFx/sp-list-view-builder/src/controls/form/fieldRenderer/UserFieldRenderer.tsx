import * as React from 'react';
import { NormalPeoplePicker, IBasePickerSuggestionsProps, IBasePicker, IPersonaProps } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { PrincipalType, FormMode, IUserFieldValue } from '../../../utilities/Entities';
import SPService from '../../../utilities/SPService';
import { isEqual, uniqBy } from "@microsoft/sp-lodash-subset";

export interface IUserFieldRendererProps extends IBaseFieldRendererProps {
    suggestionsLimit?: number;
    resolveDelay?: number;
    selectionLimit?: number;
    /**
   * Specify the user / group types to retrieve
   */
    principalTypes?: PrincipalType[];
}

export interface IUserFieldRendererState extends IBaseFieldRendererState {
    mostRecentlyUsedPersons?: IPersonaProps[];
}

export class UserFieldRenderer extends BaseFieldRenderer {

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
            this.setValue(personas);
        }
    }

    public componentDidUpdate(prevProps: IUserFieldRendererProps, prevState: IBaseFieldRendererState) {
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
        return null;
    }

    private _renderNewOrEditForm() {
        const { disabled, suggestionsLimit, selectionLimit, resolveDelay } = this.props as IUserFieldRendererProps;
        const { value } = this.state;
        const items: IPersonaProps[] = value instanceof Array ? suggestionsLimit > 0 ? value.slice(0, suggestionsLimit) : value : [];
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
                placeholder: ''
            }}
            componentRef={this._userField}
            resolveDelay={resolveDelay || 300}
            disabled={disabled}
            onChange={this.setValue.bind(this)}
        />;
    }

    private async onFilterChanged(searchText: string, currentSelected: IPersonaProps[]): Promise<IPersonaProps[]> {
        const { suggestionsLimit, principalTypes } = this.props as IUserFieldRendererProps;
        if (searchText.length > 2) {
            const users = await SPService.searchPeople(searchText, suggestionsLimit, principalTypes, true);
            //const users = await SPService.findSiteUsers(searchText, suggestionsLimit, principalTypes) || [];
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
            const value = this.getValue();
            if (value instanceof Array && defaultValue instanceof Array) {
                if (value.length !== defaultValue.length) return true;
                const arr1 = value.sort((a, b) => a.Id - b.Id);
                const arr2 = defaultValue.sort((a, b) => a.Id - b.Id);
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i].Id !== arr2[i].Id) return true;
                }
                return false;
            }
            if (!value) {
                return !!defaultValue;
            }
            if (!defaultValue) {
                return !!value;
            }
            return false;
        }
    }
}