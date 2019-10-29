import * as React from 'react';
import { ListForm } from './ListForm';

export class TaskForm extends ListForm {

    constructor(props) {
        super(props);

        this.state = {
           ...props
        };
    }

    _getFields = () => {
        return [{
            key: 'Title',
            internalName: 'Title',
            type: 'text',
            title: 'Title',
            required: true
        }];
    }

    render() {
      return super.render();
    }
}

export default TaskForm;