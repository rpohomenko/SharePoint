import * as React from 'react';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';

import { Label } from 'office-ui-fabric-react/lib/Label';
import { FormField } from './FormField';


export class ListForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ...props
        };
    }

    _getFields = () => {
        throw "Method _getFields is not yet implemented!";
    }

    _getCommandBar(mode) {
        switch (mode) {
            case 0:
                return {
                    className: 'ms-bgColor-neutral',
                    key: 'edit',
                    name: 'Edit',
                    iconProps: {
                        iconName: 'Edit'
                    },
                    onClick: (ev) => {
                        ev.preventDefault();
                    }
                };
            case 1:
                return {
                    className: 'ms-bgColor-neutral',
                    key: 'save',
                    name: 'Save',
                    iconProps: {
                        iconName: 'Save'
                    },
                    onClick: (ev) => {
                        ev.preventDefault();
                        const isValid = false;
                        if (isValid) {

                        } else {

                        }
                    }
                };
        }
    }

    componentDidMount() {
        if (!this.state.fields) {
            this.setState({ fields: this._getFields() });
        }
    }

    render() {      
        const { mode,  fields } = this.state;
        if (fields) {
            return (
                <div className='form-container'>
                    {fields.map((field, i) => (
                        <FormField key={field.internalName} fieldProps={field} mode={mode} />
                    ))}
                </div>
            );
        }
        return null;
    }
}

export default ListForm;