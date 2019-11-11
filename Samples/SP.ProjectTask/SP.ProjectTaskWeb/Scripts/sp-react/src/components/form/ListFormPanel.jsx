import * as React from 'react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';

export class ListFormPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ...props,
            hideDialog: true
        };

        this._onSaveClick = this._onSaveClick.bind(this);
        this._onSaveClickAsync = this._onSaveClickAsync.bind(this);
    }

    render() {
        const { newItemHeader, editItemHeader, viewItemHeader } = this.props;
        const { showPanel, hideDialog, listForm } = this.state;
        let headerText;
        if (listForm) {
            switch (listForm.props.mode) {
                case 0:
                    headerText = viewItemHeader
                    break;
                case 1:
                    headerText = editItemHeader
                    break;
                case 2:
                    headerText = newItemHeader
                    break;
            }
        }
        return listForm ?
            (<div>
                <Panel
                    isOpen={showPanel}
                    isLightDismiss={true}
                    headerText={headerText}
                    onDismiss={this._hidePanel}
                    onLightDismissClick={this._showDialog}
                    closeButtonAriaLabel="Close"
                    type={PanelType.medium}
                    onRenderFooterContent={this._onRenderFooterContent}
                    isFooterAtBottom={true}>
                    {listForm}
                </Panel>
                {listForm.props.mode > 0 &&
                    (<Dialog
                        hidden={hideDialog}
                        onDismiss={this._closeDialog}
                        dialogContentProps={{
                            type: DialogType.normal,
                            title: 'Are you sure you want to close the form without saving?'
                        }}
                        modalProps={{
                            titleAriaId: 'myLabelId',
                            subtitleAriaId: 'mySubTextId',
                            isBlocking: true,
                            styles: { main: { maxWidth: 450 } }
                        }}
                    >
                        <DialogFooter>
                            <PrimaryButton onClick={this._closeDialogAndHidePanel} text="Yes" />
                            <DefaultButton onClick={this._closeDialog} text="No" />
                        </DialogFooter>
                    </Dialog>)}
            </div>)
            : null;
    }

    _onSaveClick = () => {
        if (this._listForm) {
            return this._listForm.saveItem();
        }
    }

    _onSaveClickAsync = async () => {
        if (this._listForm) {
            const result = await this._listForm.saveItemAsync();         
            if (result === 0) {//OK
                this._hidePanel();
            }
        }
    }

    _onRenderFooterContent = () => {
        const { listForm } = this.state;      
        if (listForm && listForm.props.mode > 0) {
            return (
                <div>
                    <PrimaryButton onClick={this._onSaveClickAsync}>Save</PrimaryButton>
                    <DefaultButton onClick={this._hidePanel}>Cancel</DefaultButton>
                </div>);
        }
        return null;
    }

    _showPanel = () => {
        this.setState({ showPanel: true });
    };

    _hidePanel = () => {
        const { showPanel, hideDialog, listForm } = this.state;
        if (showPanel && (hideDialog || (listForm && listForm.props.mode === 0))) {
            this.setState({ showPanel: false });
        }
    };

    _showDialog = () => {
        const { listForm } = this.state;
        if (listForm && listForm.props.mode > 0) {
            this.setState({ hideDialog: false });
        }
        else {
            this._hidePanel();
        }
    };

    _closeDialog = () => {
        this.setState({ hideDialog: true });
    };

    _closeDialogAndHidePanel = () => {
        this.setState({ showPanel: false });
        this._closeDialog();
    };
}

export default ListFormPanel;
