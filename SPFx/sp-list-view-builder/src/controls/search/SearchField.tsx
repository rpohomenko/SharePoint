import * as React from 'react';
import { FormMode, IFilter, FilterType } from '../../utilities/Entities';
import { ISearchFieldProps, ISearchFieldState } from './ISearchFieldProps';
import { FormField } from '../form/FormField';
import { IValidationResult } from '../form/fieldRenderer/IBaseFieldRendererProps';

export class SearchField extends React.Component<ISearchFieldProps, ISearchFieldState> {

    private _formField: React.RefObject<FormField>;

    constructor(props: ISearchFieldProps) {
        super(props);

        this.state = {

        };

        this._formField = React.createRef();
    }

    public componentDidMount() {
    }

    public componentDidUpdate(prevProps: ISearchFieldProps, prevState: ISearchFieldState) {

    }

    public componentWillUnmount() {

    }

    public render() {
        const { field, filterType, defaultValue, disabled, onChange, onGetFieldRenderer, onValidate } = this.props;

        return field && <FormField ref={this._formField} label={null} field={field} mode={FormMode.New} disabled={disabled}
            defaultValue={defaultValue} onGetFieldRenderer={onGetFieldRenderer} onValidate={onValidate}
            onChange={(value: any, isDirty: boolean) => {
                const filter: IFilter = {
                    Field: field.Name,
                    Type: filterType || FilterType.Equals,
                    Value: value
                };

                if (filterType === FilterType.Equals || filterType === FilterType.NotEquals) {
                    if (value === "" || value === null) {
                        filter.Value = null;
                        filter.Type = filterType === FilterType.Equals ? FilterType.Empty : FilterType.NotEmpty;
                    }
                }

                if (onChange instanceof Function) {
                    onChange(filter);
                }
            }} />;
    }

    public async validate(disableEvents?: boolean): Promise<IValidationResult> {
        if (this._formField.current) {
            return await this._formField.current.validate(disableEvents);
        }
    }

    public get isValid(): boolean {
        if (this._formField.current) {
            return this._formField.current.isValid;
        }
    }

    public get isDirty(): boolean {
        if (this._formField.current) {
            return this._formField.current.isDirty;
        }
    }
}