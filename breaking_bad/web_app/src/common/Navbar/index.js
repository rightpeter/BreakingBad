// @flow
import React from 'react';
import fire from '../../config/Fire';
import './styles.css';
import Logo from '../../assets/logo.svg'
import { Link } from 'react-router-dom';

class Navbar extends React.Component {

  constructor(props) {
		super(props);
    this.handleLogout = this.handleLogout.bind(this);
    this.state ={
      email: '',
      userInfo: null
    }
	}

  handleLogout() {
    fire.auth().signOut();
  }

  render() {
      return(
        <div className="navbar">
          <div className="logo-container">
            {/*<img src={Logo}></img>*/}
            <span className="logo">Breaking Bad</span>
          </div> 
          <div className="left-link-container">
          </div>
          <div className="right-link-container">
            <span style={{ color:'white' }} onClick={this.handleLogout}>Sign Out</span>
            <Link style={{ textDecoration: 'none' }} to="/config"><span style={{color:'white', marginRight:'2em'}}>Configuration</span></Link>
            <Link style={{ textDecoration: 'none' }} to="/calendar"><span style={{color:'white', marginRight:'2em'}}>Calendar</span></Link>
            <Link style={{ textDecoration: 'none' }} to="/help"><span style={{color:'white', marginRight:'2em'}}>Help</span></Link>
          </div>
        </div>
      );
    } 
}

export default Navbar;
