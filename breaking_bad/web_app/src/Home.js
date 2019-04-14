import UserConfig from './components/UserConfig';
import Navbar from "./common/Navbar";
import React, { Component } from 'react';
import fire from './config/Fire';
import Login from './components/Login';
import './App.css';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: {},
    }
  }

  componentDidMount() {
    this.authListener();
  }

  authListener() {
    fire.auth().onAuthStateChanged((user) => {
      console.log(user);
      if (user) {
        this.setState({ user });
        localStorage.setItem('user', user.uid);
      } else {
        this.setState({ user: null });
        localStorage.removeItem('user')
      }
    });
  }

  render() {

    return (
      <div className="App">
        {this.state.user ? (
          <div>
            <Navbar />
          </div>) :
          (<Login />)}
      </div>


    )
  };
}

export default Home;
