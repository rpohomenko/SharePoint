import * as React from 'react';
import { IListFormProps, IListFormState } from './IListFormProps';
import { FormField } from './FormField';
import { FormMode, IListItem } from '../../utilities/Entities';
import { cancelable, CancelablePromise } from 'cancelable-promise';

interface CancelablePromise {
    cancel: () => void;
}

export class ListForm extends React.Component<IListFormProps, IListFormState> {

    private _formFields: FormField[];
    private _promise: CancelablePromise;

    constructor(props: IListFormProps) {
        super(props);

        this.state = {
            mode: props.mode,
            item: null
        };
    }

    public async componentDidMount() {
        const { itemPromise } = this.props;
        if (itemPromise) {
            this.setState({
                isLoading: true
            });
            this._promise = cancelable(itemPromise);
            const item = await itemPromise;
            this._promise = undefined;
            this.setState({
                item: item,
                isLoading: false
            });
        }
    }

    public componentWillUnmount() {
        if (this._promise) {
            this._promise.cancel();
        }
    }

    public componentDidUpdate(prevProps: IListFormProps, prevState: IListFormState) {
        if (prevProps.mode != this.props.mode || prevProps.itemPromise != this.props.itemPromise) {
            this.setState({ mode: this.props.mode });
            if (prevProps.itemPromise != this.props.itemPromise) {
                this.setState({                 
                    item: null
                }, () => {
                    this.componentDidMount();
                });
            }
        }
    }

    public render() {
        const { fields, onChange } = this.props;
        const { mode, item } = this.state;

        this._formFields = [];
        return <div className="list-form">
            {fields instanceof Array && fields.length > 0
                && fields.map(field => <FormField key={field.Id} 
                    defaultValue={item ? item[field.Name]: undefined}
                    ref={ref => {
                        if (ref != null) {
                            this._formFields.push(ref);
                        }
                    }}
                    field={field} mode={mode}
                    onValidate={(result) => {

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