import * as React from 'react';
import { IListFormProps, IListFormState } from './IListFormProps';
import { FormField } from './FormField';
import { FormMode } from '../../utilities/Entities';

export class ListForm extends React.Component<IListFormProps, IListFormState> {

    private _formFields: FormField[];

    constructor(props: IListFormProps) {
        super(props);

        this.state = {
            mode: props.mode
        };
    }

    public componentDidMount() {
    }

    public componentDidUpdate(prevProps: IListFormProps, prevState: IListFormState) {
        if (prevProps.mode != this.props.mode) {
            this.setState({
                mode: this.props.mode
            });
        }
    }

    public render() {
        const { fields, onChange } = this.props;
        const { mode } = this.state;
        this._formFields = [];
        return <div className="list-form">
            {fields instanceof Array && fields.length > 0
                && fields.map(field => <FormField key={field.Id}
                ref={ref => {
                    if (ref != null) {
                        this._formFields.push(ref);
                    }
                }}
                    field={field} mode={mode}
                    onValidate={(result)=>{

                    }}
                    onChange={(value) => {
                        if (onChange instanceof Function) {
                            onChange(field, value);
                        }
                    }} />)}
        </div>;
    }

    public save() {

    }

    public set_Mode(mode: FormMode) {
        this.setState({ mode: mode });
    }

    public validate(disableEvents?: boolean) {
        if (this._formFields instanceof Array) {
            for (const formField of this._formFields) {
                formField.validate(disableEvents);
            }
        }
    }
}