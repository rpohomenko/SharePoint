import * as React from 'react';
import ErrorBoundary from '../../ErrorBoundary';
import { IBaseFieldRendererProps, IBaseFieldRendererState, IValidationResult } from './IBaseFieldRendererProps';
import { FormMode } from '../../../utilities/Entities';
import { isEqual } from "@microsoft/sp-lodash-subset";

export class BaseFieldRenderer extends React.Component<IBaseFieldRendererProps, IBaseFieldRendererState> {

    constructor(props: IBaseFieldRendererProps) {
        super(props);

        this.state = {
            mode: props.mode,
            //value: props.defaultValue,
            validationResult: undefined
        };
    }

    public componentDidMount() {
    }

    public componentDidUpdate(prevProps: IBaseFieldRendererProps, prevState: IBaseFieldRendererState) {
        if (!isEqual(prevProps.mode, this.props.mode)) {
            this.setState({
                mode: this.props.mode
            });
        }
        //if (!isEqual(prevProps.defaultValue, this.props.defaultValue)) {
        //if (this.state.value === undefined) {
        //this.setState({
        // value: undefined //this.props.defaultValue,
        // });
        //}
        //}
    }

    public render() {
        const { mode, validationResult } = this.state;

        return (<>
            <ErrorBoundary>
                {mode === FormMode.New ? this.onRenderNewForm() : null}
                {mode === FormMode.Edit ? this.onRenderEditForm() : null}
                {mode === FormMode.Display ? this.onRenderDispForm() : null}
            </ErrorBoundary>
            {validationResult && validationResult.isValid === false ? this._renderValidationErrors(validationResult.validationErrors) : null}
        </>);
    }

    public get isValid(): boolean {
        const { validationResult } = this.state;
        return validationResult && validationResult.isValid;
    }

    public get isDirty(): boolean {
        const { mode, defaultValue } = this.props;
        return mode === FormMode.New ? this.hasValue() : !isEqual(this.getValue(), defaultValue);
    }

    public hasValue(): boolean {
        const value = this.getValue();
        return value !== null && value !== undefined;
    }

    public async validate(disableEvents?: boolean): Promise<IValidationResult> {
        const { onValidate, required, title } = this.props;
        const result = this.onValidate() || { isValid: true } as IValidationResult;
        if (!(result.validationErrors instanceof Array)) {
            result.validationErrors = [];
        }
        const resultAsync = await this.onValidateAsync();
        if (resultAsync && resultAsync.isValid !== true) {
            result.isValid = false;
            if (resultAsync.validationErrors instanceof Array) {
                resultAsync.validationErrors.forEach(validationError => result.validationErrors.push(validationError));
            }
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
            if (!disableEvents && onValidate instanceof Function) {
                onValidate(result);
            }
        });
        return result;
    }

    public getValue() {
        if (this.state.value === undefined) {
            return null;
        }
        return this.state.value;
    }

    public setValue(newValue: any) {
        this.setState({ value: newValue }, () => {
            this.validate().then(validationResult => {
                //if (validationResult.isValid /*&& this.isDirty === true*/) {
                this.onChange(this.getValue());
                //}
            });
        });
    }

    protected onRenderNewForm(): JSX.Element {
        throw (`Method onRenderNewForm is not yet implemented, field type: ${this.props.dataType}.`);
    }

    protected onRenderEditForm(): JSX.Element {
        throw (`Method onRenderEditForm is not yet implemented, field type: ${this.props.dataType}.`);
    }

    protected onRenderDispForm(): JSX.Element {
        throw (`Method onRenderDispForm is not yet implemented, field type: ${this.props.dataType}.`);
    }

    protected onValidate(): IValidationResult {
        return null;
        //throw (`Method onValidate is not yet implemented, field type: ${this.props.dataType}.`);
    }

    protected async onValidateAsync(): Promise<IValidationResult> {
        return null;
        //throw (`Method onValidateAsync is not yet implemented, field type: ${this.props.dataType}.`);
    }

    protected onChange(value: any) {
        const { onChange } = this.props;
        if (onChange instanceof Function) {
            onChange(value, this.isDirty);
        }
    }

    public setValidationResult(validationResult: IValidationResult) {
        this.setState({ validationResult: validationResult });
    }

    private _renderValidationErrors = (validationErrors: string[]) => {
        if (!(validationErrors instanceof Array)) {
            return null;
        }
        const errorStyle = {
            color: 'red'
        };
        return (<>{validationErrors.map((err: string, i: number) => <div key={`err_${i}`} style={errorStyle}>{err}</div>)}</>);
    }
}