import * as React from 'react';
import ErrorBoundary from '../../ErrorBoundary';
import { IBaseFieldRendererProps, IBaseFieldRendererState, ValidationResult } from './IBaseFieldRendererProps';
import { DataType, FormMode } from '../../../utilities/Entities';
import { isEqual } from '@microsoft/sp-lodash-subset';

export class BaseFieldRenderer extends React.Component<IBaseFieldRendererProps, IBaseFieldRendererState> {

    constructor(props: IBaseFieldRendererProps) {
        super(props);

        this.state = {
            mode: props.mode,
            value: props.defaultValue,
            validationResult: undefined
        };
    }

    public componentDidMount() {
    }

    public componentDidUpdate(prevProps: IBaseFieldRendererProps, prevState: IBaseFieldRendererState) {
        if (prevProps.mode != this.props.mode) {
            this.setState({
                mode: this.props.mode
            });
        }
    }

    public render() {
        const { mode } = this.props;
        const { validationResult } = this.state;

        return (<>
            <ErrorBoundary>
                {mode === FormMode.New ? this.onRenderNewForm() : null}
                {mode === FormMode.Edit ? this.onRenderEditForm() : null}
                {mode === FormMode.Display ? this.onRenderDispForm() : null}
            </ErrorBoundary>
            {validationResult && !validationResult.isValid ? this._renderValidationErrors(validationResult.validationErrors) : null}
        </>);
    }

    public get isValid(): boolean {
        const { validationResult } = this.state;
        return validationResult.isValid;
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        const { value } = this.state;
        return mode === FormMode.New ? this.hasValue() : value !== defaultValue;
    }

    public hasValue(): boolean {
        return this.getValue() !== null && this.getValue() !== undefined;
    }

    public validate(disableEvents?: boolean): ValidationResult {
        const { onValidate, required, title } = this.props;
        const result = this.onValidate() || {} as ValidationResult;
        if (!(result.validationErrors instanceof Array)) {
            result.validationErrors = [];
        }
        if (required === true) {
            if (!this.hasValue()) {
                result.isValid = false;
                result.validationErrors.push(`Field "${title}" is required.`);
            }
        }
        this.setState({
            validationResult: result
        }, () => {
            if (!disableEvents && typeof onValidate === "function") {
                onValidate(result);
            }
        });
        return result;
    }

    public getValue() {
        return this.state.value;
    }

    public setValue(newValue) {
        this.setState({ value: newValue }, () => {
            const validationResult = this.validate();
            if (validationResult.isValid) {
                this.onChange(newValue);
            }
        });
    }

    protected onRenderNewForm(): JSX.Element {
        throw (`Method _renderNewForm is not yet implemented, field type: ${this.props.dataType}.`);
    }

    protected onRenderEditForm(): JSX.Element {
        throw (`Method _renderEditForm is not yet implemented, field type: ${this.props.dataType}.`);
    }

    protected onRenderDispForm(): JSX.Element {
        throw (`Method _renderDispForm is not yet implemented, field type: ${this.props.dataType}.`);
    }

    protected onValidate(): ValidationResult {
        throw (`Method _validate is not yet implemented, field type: ${this.props.dataType}.`);
    }

    protected onChange(value) {
        const { onChange } = this.props;
        if (typeof onChange === "function") {
            onChange(value);
        }
    }

    private _renderValidationErrors = (validationErrors) => {
        if (!validationErrors) {
            return null;
        }
        const errorStyle = {
            color: 'red'
        };
        return (<>{validationErrors.map((err, i) => <div key={`err_${i}`} style={errorStyle}>{err}</div>)}</>);
    }
}