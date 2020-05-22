import * as React from 'react';
import { Dropdown, DropdownMenuItemType, IDropdownOption, IDropdownStyles, Label, IDropdown } from 'office-ui-fabric-react' /* '@fluentui/react'*/;
import { BaseFieldRenderer } from './BaseFieldRenderer';
import { IBaseFieldRendererProps, IBaseFieldRendererState } from './IBaseFieldRendererProps';
import { isEqual } from '@microsoft/sp-lodash-subset';

export interface IChoiceFieldRendererProps extends IBaseFieldRendererProps {
    choices: string[];
    multiSelect?: boolean;
}

export interface IChoiceFieldRendererState extends IBaseFieldRendererState {
    options: IDropdownOption[];
}

export class ChoiceFieldRenderer extends BaseFieldRenderer {

    private _choiceField: React.RefObject<IDropdown>;

    constructor(props: IChoiceFieldRendererProps) {
        super(props);
        this._choiceField = React.createRef();
        this.state = {
            ...this.state,
            options: props.choices instanceof Array ? props.choices.map((choice, i) => {
                return {
                    key: i.toString(),
                    text: choice
                } as IDropdownOption;
            }) : []
        } as IChoiceFieldRendererState;
    }

    public componentDidMount() {
        const { choices, defaultValue } = this.props as IChoiceFieldRendererProps;
        const { value, options } = this.state as IChoiceFieldRendererState;
        if (choices instanceof Array) {
            const newOptions = choices instanceof Array ? choices.map((choice, i) => {
                return {
                    key: i.toString(),
                    text: choice
                } as IDropdownOption;
            }) : [];

            if (!isEqual(options, newOptions)) {
                this.setState({ options: options } as IChoiceFieldRendererState);
            }

            if (defaultValue instanceof Array) {
                const newValue = options.filter(option => defaultValue.some(v => v === option.text))
                    .map(option => option.key);
                if (!isEqual(value, newValue)) {
                    this.setValue(newValue);
                }
            }
            else {
                this.setValue(null);
            }
        }
    }

    public componentDidUpdate(prevProps: IChoiceFieldRendererProps, prevState: IChoiceFieldRendererState) {
        super.componentDidUpdate(prevProps, prevState);
        if (!isEqual(prevProps.defaultValue, this.props.defaultValue)
            || !isEqual(prevProps.choices, (this.props as IChoiceFieldRendererProps).choices)) {
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
        if (this.props.defaultValue instanceof Array) {
            return <>{this.props.defaultValue.map((v, i) => <Label key={`choice_${i}`}>{v}</Label>)}</>;
        }
        return null;
    }

    private _renderNewOrEditForm() {
        const { defaultValue, disabled, multiSelect } = this.props as IChoiceFieldRendererProps;
        const { value, options } = this.state as IChoiceFieldRendererState;
        const dropdownStyles: Partial<IDropdownStyles> = { dropdown: { maxWidth: 300 } };

        return <Dropdown
            componentRef={this._choiceField}
            disabled={disabled}
            selectedKey={value}
            multiSelect={multiSelect}
            onChange={(ev, option?: IDropdownOption) => {
                this.setValue(option ? [option.key] : null);
            }}
            placeholder="Select an option..."
            options={options}
            styles={dropdownStyles}
        />;
    }

    public getValue() {
        const value = super.getValue();
        const { options } = this.state as IChoiceFieldRendererState;
        if (value !== null && value instanceof Array) {
            return options.filter(option => value.some(v => v === option.key))
                .map(option => option.text);
        }
        return value;
    }

    public hasValue() {
        return super.hasValue();
    }
}