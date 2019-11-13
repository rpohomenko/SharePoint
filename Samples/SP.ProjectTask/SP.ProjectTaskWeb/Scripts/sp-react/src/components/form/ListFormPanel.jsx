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
    }    

    render() {
        const { newItemHeader, editItemHeader, viewItemHeader } = this.props;
        const { showPanel, hideDialog, listForm, isDirty } = this.state;
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
                {listForm.props.mode > 0 && isDirty &&
                    (<Dialog
                        hidden={hideDialog}
                        onDismiss={this._closeDialog}
                        dialogContentProps={{
                            type: DialogType.normal,
                            title: 'Close?',
                            subText: 'Are you sure you want to close the form without saving?'
                        }}
                        modalProps={{                           
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

    _onSaveClick = async () => {
        const { isValid, isDirty } = this.state;
        if (this._listForm /*&& isValid*/ && isDirty) {
            this.setState({isValid: false, isDirty: false});
            const result = await this._listForm.saveItemAsync();
            if (result === 1) {//OK
                this._hidePanel(result);
            }
        }
    }

    _onRenderFooterContent = () => {
        const { listForm, isValid, isDirty } = this.state;
        if (listForm && listForm.props.mode > 0) {
            return (
                <div>
                    <PrimaryButton onClick={this._onSaveClick} disabled={!isDirty || !isValid} style={{marginRight: 7}}>Save</PrimaryButton>
                    <DefaultButton onClick={this._hidePanel}>Cancel</DefaultButton>
                </div>);
        }
        return null;
    }

    _showPanel = () => {
        this.setState({ showPanel: true });
    };

    _hidePanel = (result) => {
        const { onClose } = this.props;
        const { showPanel, hideDialog, listForm, isDirty } = this.state;
        if (showPanel && (hideDialog || !isDirty || (listForm && listForm.props.mode === 0))) {
            this.setState({ showPanel: false, isDirty: false, isValid: false });
            if (typeof onClose === "function") {
                onClose(this, result);
            }
        }
    };

    _showDialog = () => {
        const { listForm, isDirty } = this.state;
        if (isDirty && listForm && listForm.props.mode > 0) {
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
        this.setState({ showPanel: false, isDirty: false, isValid: false });
        this._closeDialog();
    };
}

export default ListFormPanel;
