import * as React from 'react';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { CompactPeoplePicker, IBasePickerSuggestionsProps, ValidationState, IBasePicker } from 'office-ui-fabric-react/lib/Pickers';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { PrincipalType } from '../../../utilities/Entities';
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
    mostRecentlyUsedPersons;
}

export class UserFieldRenderer extends BaseFieldRenderer {

    private _userField: React.RefObject<IBasePicker<IPersonaProps>>;

    constructor(props: IUserFieldRendererProps) {
        super(props);
        this._userField = React.createRef();
    }


    public componentDidMount() {
        /* if (typeof this.props.defaultValue === "boolean") {          
             this.setValue(this.props.defaultValue);
         }
         else if (this.props.defaultValue === "0" || this.props.defaultValue === "1" || this.props.defaultValue === "false" || this.props.defaultValue === "true") {
             this.setValue(Boolean(this.props.defaultValue));
         }*/
    }

    public componentDidUpdate(prevProps: IUserFieldRendererProps, prevState: IBaseFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (prevProps.defaultValue !== this.props.defaultValue) {
            if (this.props.defaultValue instanceof Array) {
                this.setValue(this.props.defaultValue.map(item => {
                    return {
                        text: item.Title,
                        id: item.ID,
                        imageUrl: "",
                        imageAlt: ""
                    } as IPersonaProps;
                }));
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
        /* if (typeof this.props.defaultValue === "boolean" || this.props.defaultValue === "0" || this.props.defaultValue === "1" || this.props.defaultValue === "false" || this.props.defaultValue === "true") {
             return <Label>{Boolean(this.props.defaultValue) === true ? "Yes" : "No"}</Label>;
         }*/
        return null;
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled, suggestionsLimit, selectionLimit, resolveDelay } = this.props as IUserFieldRendererProps;
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
        return <CompactPeoplePicker
            onResolveSuggestions={this.onFilterChanged}
            onEmptyInputFocus={this.returnMostRecentlyUsedPerson}
            getTextFromItem={(peoplePersonaMenu: IPersonaProps) => peoplePersonaMenu.text}
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
            onChange={this.onChange}
        />;
    }

    private async onFilterChanged(searchText: string, currentSelected: IPersonaProps[]): Promise<IPersonaProps[]> {
        const { defaultValue, disabled, suggestionsLimit, principalTypes, selectionLimit, resolveDelay } = this.props as IUserFieldRendererProps;
        if (searchText.length > 2) {
            const users = await SPService.searchPeople(searchText, suggestionsLimit, principalTypes, false);
            const results = null;
            // Remove duplicates
            const { value, mostRecentlyUsedPersons } = this.state as IUserFieldRendererState;
            const filteredPersons = this.removeDuplicates(results, value);
            // Add the users to the most recently used ones
            let recentlyUsed = [...filteredPersons, ...mostRecentlyUsedPersons];
            recentlyUsed = uniqBy(recentlyUsed, "text");
            this.setState({
                mostRecentlyUsedPersons: recentlyUsed.slice(0, suggestionsLimit)
            } as IUserFieldRendererState);
            return filteredPersons;
        } else {
            return [];
        }
    }


    /**
 * Returns the most recently used person
 *
 * @param currentPersonas
 */
    private returnMostRecentlyUsedPerson = (currentPersonas: IPersonaProps[]): IPersonaProps[] => {
        let { mostRecentlyUsedPersons } = this.state as IUserFieldRendererState;
        return this.removeDuplicates(mostRecentlyUsedPersons, currentPersonas);
    }


    /**
     * Removes duplicates
     *
     * @param personas
     * @param possibleDupes
     */
    private removeDuplicates = (personas: IPersonaProps[], possibleDupes: IPersonaProps[]): IPersonaProps[] => {
        return personas.filter(persona => !this.listContainsPersona(persona, possibleDupes));
    }

    /**
    * Checks if list contains the person
    *
    * @param persona
    * @param personas
    */
    private listContainsPersona = (persona: IPersonaProps, personas: IPersonaProps[]): boolean => {
        if (!personas || !personas.length || personas.length === 0) {
            return false;
        }
        return personas.filter(item => item.text === persona.text).length > 0;
    }

    private getUserPhotoLink(siteUrl: string, accountName: string): string {
        return `${siteUrl}/_layouts/15/userphoto.aspx?accountname=${encodeURIComponent(accountName)}&size=S`;
    }

    public hasValue() {
        return super.hasValue();
    }
}