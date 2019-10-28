import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Panel } from 'office-ui-fabric-react/lib/Panel';
import * as React from 'react';

export class ListFormPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ...props,
            hideDialog: true
        };
    }

    render() {
        const { showPanel, hideDialog, listForm } = this.state;
        let headerText;
        if (listForm) {
            switch (listForm.props.mode) {
                case 0:
                    headerText = "View"
                    break;
                case 1:
                    headerText = "Edit"
                    break;
                case 2:
                    headerText = "New"
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
                >
                    {listForm}
                </Panel>
                <Dialog
                    hidden={hideDialog}
                    onDismiss={this._closeDialog}
                    dialogContentProps={{
                        type: DialogType.normal,
                        title: 'Are you sure you want to close the form?'
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
                </Dialog>
            </div>)
            : null;
    }

    _showPanel = () => {
        this.setState({ showPanel: true });
    };

    _hidePanel = () => {
        if (this.state.hideDialog) {
            this.setState({ showPanel: false });
        }
    };

    _showDialog = () => {
        this.setState({ hideDialog: false });
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
