import React from 'react'
import PropTypes from 'prop-types';
//import {SearchBox} from 'office-ui-fabric-react/lib/SearchBox'
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Persona, PersonaInitialsColor, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';

class Account extends React.Component {
  constructor(props) {
    super(props);  
    if (window._spPageContextInfo) {
      this._persona = {
        /*primaryText*/ text: _spPageContextInfo.user.Name,
        secondaryText: _spPageContextInfo.user.Email || _spPageContextInfo.user.Login,
        tertiaryText: '',
        optionalText: _spPageContextInfo.user.Login,
        //imageInitials: _spPageContextInfo.user.Initials
      };
    }
    this.state = {
      open: false
    }
  }

  componentDidMount() {

  }

  render() {
    const { open } = this.state;
    return (
      <PrimaryButton className="navbar-login" style={{
        backgroundColor: 'transparent',
        minWidth: '40px',
        //width: '40px',
        height: '40px',
        padding: '4px'
      }}
        onClick={() => this.setState({open: !open})}>
        <Persona {...this._persona} size={PersonaSize.size32} hidePersonaDetails={false} />
        {open && (<Panel ref={ref => this._panel = ref}
                        isOpen={open}
                        isLightDismiss={true}
                        headerText="Account"
                        onDismiss={() => this.setState({open: false})}
                        closeButtonAriaLabel="Close"
                        type={PanelType.smallFixedFar}
                        isFooterAtBottom={true}>
                         <Persona {...this._persona} size={PersonaSize.size48} hidePersonaDetails={false} />
                  </Panel>)
          }
      </PrimaryButton>
    );
  }
}

//export default Account

const NavBar = ({ header }) => { 
  return (
    <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
      <div className="navBar">
        <span className="navbar-brand">{header}</span>
      </div>
      <Account />
    </nav>
  );
}

NavBar.propTypes = {
  header: PropTypes.string
}

NavBar.defaultProps = {
  header: "Project Task"
}

export default NavBar