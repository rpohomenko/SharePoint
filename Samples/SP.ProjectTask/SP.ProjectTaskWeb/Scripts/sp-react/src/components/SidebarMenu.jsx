import React from 'react';
import PropTypes from 'prop-types';
import { Nav, INavLinkGroup } from 'office-ui-fabric-react/lib/Nav'
import { Collapse, Navbar, NavbarToggler, NavbarBrand } from 'reactstrap';


export class SidebarMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: true
    };

    this._toggle = this._toggle.bind(this);
  }

  _toggle = (e) => {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  render() {
    const { title, groups, expanded, collapsed } = this.props;
    const { isOpen } = this.state;
    return (<Navbar color="faded" light>
      <NavbarBrand>{title}</NavbarBrand>
      <NavbarToggler onClick={this._toggle} className="mr-2 d-block d-xs-none d-md-none"/>
      <Collapse isOpen={isOpen} navbar={true}>
        <div className="ml-auto" >
          <Nav className='sidebar-menu' groups={groups}
            expandedStateText={expanded}
            collapsedStateText={collapsed} />
        </div>
      </Collapse>
    </Navbar>);

  }
}

SidebarMenu.props = {
  title: PropTypes.string,
  groups: INavLinkGroup,
  expanded: PropTypes.string,
  collapsed: PropTypes.string,
}

SidebarMenu.defaultProps = {
  title: "Home",
  groups: [{
    links: [{
      name: 'Home',
      isExpanded: true,
    }, {
      name: 'Tasks',
      isExpanded: true,
    }]
  }],
  expanded: 'expanded',
  collapsed: 'collapsed',
}

export default SidebarMenu