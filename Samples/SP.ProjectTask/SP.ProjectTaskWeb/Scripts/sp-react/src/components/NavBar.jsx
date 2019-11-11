import React from 'react'
import PropTypes from 'prop-types';
import {SearchBox} from 'office-ui-fabric-react/lib/SearchBox'

const NavBar = ({onChange, onSearch}) => (
  <div className="navBar">    
    <div className="searchbox">
      <SearchBox placeholder="Search"
        underlined={true}
        onChange={(newValue) => console.log('SearchBox onChange fired: ' + newValue)}
        onSearch={(newValue) => console.log('SearchBox onSearch fired: ' + newValue)}
      />
    </div>
  </div>
)

NavBar.propTypes = {
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
}

NavBar.defaultProps = {
  onChange: (newValue) => console.log('SearchBox onChange fired: ' + newValue),
  onSearch: (newValue) => console.log('SearchBox onSearch fired: ' + newValue),
}

export default NavBar