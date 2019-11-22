import React from 'react';
import PropTypes from 'prop-types';
import { Nav } from 'office-ui-fabric-react/lib/Nav'
import { Collapse, Navbar, NavbarToggler, NavbarBrand } from 'reactstrap';

export class SidebarMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen
    };

    this._toggle = this._toggle.bind(this);
    this._onLinkClick = this._onLinkClick.bind(this);
  }

  _toggle = (e) => {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  _onLinkClick = (e, o) => {
    if (typeof this.props.onRoute == "function") {
      this.props.onRoute(o.key);
    }
  }

  render() {
    const { title, groups, expanded, collapsed, selectedKey } = this.props;
    const { isOpen } = this.state;
    return (<Navbar color="faded" light>
      <NavbarBrand>{title}</NavbarBrand>
      <NavbarToggler onClick={this._toggle} className="mr-2 d-block d-xs-none d-md-none" />
      <Collapse isOpen={isOpen} navbar={true}>
        <div className="ml-auto" >
          <Nav ref={ref => this._nav = ref} className='sidebar-menu' groups={groups}
            expandedStateText={expanded}
            collapsedStateText={collapsed}
            onLinkClick={this._onLinkClick}
            selectedKey={selectedKey}
            styles={{
              root: {
                boxSizing: 'border-box',
                border: '1px solid #eee',
                overflowY: 'auto'
              }
            }}
          />
        </div>
      </Collapse>
    </Navbar>);
  }
}

SidebarMenu.props = {
  title: PropTypes.string,
  groups: PropTypes.array,
  expanded: PropTypes.string,
  collapsed: PropTypes.string,
  selectedKey: PropTypes.string,
  onRoute: PropTypes.func
}

SidebarMenu.defaultProps = {
  title: "Home",
  groups: [{
    links: [
      {
        key: "0",
        name: 'Tasks',
        isExpanded: true
      },
      {
        key: "1",
        name: 'Projects',
        isExpanded: true
      },
      {
        key: "2",
        name: 'Employees',
        isExpanded: true
      }]
  }],
  expanded: 'expanded',
  collapsed: 'collapsed',
}

export default SidebarMenu