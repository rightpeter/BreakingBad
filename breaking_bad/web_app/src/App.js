import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Home from './Home';
import UserConfig from './components/UserConfig'
import Main from './components/Main'
import Calendar from './components/Calendar'
import HelpPage from './components/HelpPage'
import { BrowserRouter, Route } from "react-router-dom";
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: {},
    }
  }

  render() {
    return (
      <BrowserRouter>
        <div style={{background:'floralwhite'}}>
          <Route exact path='/' component={Home} />
          <Route path='/calendar' component={Calendar} />
          <Route path='/config' component={UserConfig} />
          <Route path='/login' component={Login} />
          <Route path='/help' component={HelpPage} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
