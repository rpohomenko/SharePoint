import React from "react";
import PropTypes from 'prop-types';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';

export class SearchFormPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
        this._searchForm = React.createRef();
        this._onFilterClick = this._onFilterClick.bind(this);
    }

    render() {
        const { onRenderSearchForm, service } = this.props;
        const { confirmClosePanel, showPanel, isDirty } = this.state;
        let searchForm;
        let renderSearchForm = this._renderSearchForm;

        if (typeof onRenderSearchForm === "function") {
            renderSearchForm = onRenderSearchForm;
        }
        if (showPanel) {
            searchForm = renderSearchForm(
                this._searchForm,
                service,
                (sender, isValid, isDirty) => this._validate(isValid, isDirty));

            return (
                <div className="search-panel-container" ref={this._container}>
                    <Panel
                        ref={ref => this._panel = ref}
                        isOpen={showPanel}
                        isLightDismiss={true}
                        headerText="Filter"
                        onDismiss={() => {
                            if (isDirty) {
                                this.setState({ confirmClosePanel: true });
                            }
                            else {
                                this.close();
                            }
                        }}
                        closeButtonAriaLabel="Close"
                        type={PanelType.medium}
                        onRenderFooterContent={this._onRenderFooterContent}
                        isFooterAtBottom={true}>
                        {searchForm}
                    </Panel>
                    {confirmClosePanel && isDirty &&
                        (<Dialog
                            hidden={confirmClosePanel !== true}
                            onDismiss={() => this.setState({ confirmClosePanel: false })}
                            dialogContentProps={{
                                type: DialogType.normal,
                                title: 'Close?',
                                subText: 'Are you sure you want to close the Filter?'
                            }}
                            modalProps={{
                                isBlocking: true,
                                styles: { main: { maxWidth: 450 } }
                            }}>
                            <DialogFooter>
                                <PrimaryButton onClick={() => this.setState({ confirmClosePanel: false, showPanel: false, isDirty: false, isValid: false })} text="Yes" />
                                <DefaultButton onClick={() => this.setState({ confirmClosePanel: false })} text="No" />
                            </DialogFooter>
                        </Dialog>)}
                </div>
            );
        }
        return null;
    }

    _renderSearchForm = (ref, service, onValidate) => {
        throw "Method _renderSearchForm is not yet implemented!";
    }

    _onFilterClick = () => {
        const { isValid, isDirty, onFilter } = this.state;
        if (this._searchForm.current && isValid && isDirty) {
            let filter = this._searchForm.current.getFilter();
            this.close();
            if (typeof onFilter === "function") {
                onFilter(filter);
            }
        }
    }

    _onRenderFooterContent = () => {
        const { isValid, isDirty } = this.state;
        return (
            <div>
                <PrimaryButton onClick={() => this._onFilterClick()} disabled={!isDirty || !isValid} style={{ marginRight: 7 }}>Filter</PrimaryButton>
                <DefaultButton onClick={() => this.close()}>{"Cancel"}</DefaultButton>
            </div>);

    }

    showHide() {
        const { showPanel } = this.state;
        showPanel ? this.close() : this.open();
    };

    open() {
        const { showPanel } = this.state;
        if (!showPanel) {
            this.setState({ showPanel: true });
        }
    };

    close() {
        const { showPanel } = this.state;
        if (showPanel) {
            this.setState({ showPanel: false, isDirty: false, isValid: false });
        }
    };

    _validate = (isValid, isDirty) => {
        if (this.state.isValid !== isValid || this.state.isDirty !== isDirty) {
            this.setState({ isValid: isValid, isDirty: isDirty });
        }
    }
}

SearchFormPanel.propTypes = {
}

SearchFormPanel.defaultProps = {
}

export default SearchFormPanel;