import React from 'react'
import PropTypes from 'prop-types';
//import {SearchBox} from 'office-ui-fabric-react/lib/SearchBox'

const NavBar = ({ header }) => (
  <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
    <div className="navBar">
      <span className="navbar-brand">{header}</span>
    </div>
  </nav>
)

NavBar.propTypes = {
  header: PropTypes.string
}

NavBar.defaultProps = {
  header: "Project Task"
}

export default NavBar