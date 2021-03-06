
import React from "react";

import { ListFormPanel } from './ListFormPanel';
import { TaskForm } from './TaskForm';

export class TaskFormPanel extends ListFormPanel {

    constructor(props) {
        super(props);
    }

    render() {
        return super.render();
    }

    _renderListForm = (mode, ref, item, itemId, onRenderCommandBar, onValidate, onChangeMode, onCloseForm, onItemSaving, onItemSaved, onItemDeleting, onItemDeleted, onItemLoaded) => {
        return (<TaskForm ref={ref} service={this.props.service} mode={mode}
            item={mode < 2 ? item : undefined} itemId={mode < 2 ? itemId : undefined}
            onRenderCommandBar={onRenderCommandBar}
            onValidate={onValidate}
            onChangeMode={onChangeMode}
            onCloseForm={(sender) => onCloseForm(null)}
            onSaving={onItemSaving}
            onDeleting={onItemDeleting}
            onDeleted={(sender, item) => {
                if (sender._status) {
                    sender._status.success("Deleted successfully.", this.props.STATUS_TIMEOUT);
                }
                onCloseForm({ ok: true, data: [item] }, onItemDeleted);
            }}
            onSaved={(sender, item) => {
                if (sender._status) {
                    sender._status.success("Saved successfully.", this.props.STATUS_TIMEOUT);
                }
                onCloseForm({ ok: true, data: item, isNewItem: mode === 2 }, onItemSaved)
            }}
            onItemLoaded={onItemLoaded} />);
    }
}

export default TaskFormPanel;