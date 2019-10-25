import React from 'react'
import PropTypes from 'prop-types';
import {Nav, INavLinkGroup} from 'office-ui-fabric-react/lib/Nav'

const SidebarMenu = ({groups, expanded, collapsed}) => (
  <div className='sidebar-menu'>
    <Nav groups={groups}
      expandedStateText={expanded}
      collapsedStateText={collapsed}
    />
  </div>
)

SidebarMenu.props = {
  groups: INavLinkGroup,
  expanded: PropTypes.string,
  collapsed: PropTypes.string,
}

SidebarMenu.defaultProps = {
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