import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Home from './Home';
import UserConfig from './components/UserConfig'
import Calendar from './components/Calendar'
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
          <Route path='/' component={Home} />
          <Route path='/calendar' component={Calendar} />
          <Route path='/config' component={UserConfig} />
          <Route path='/login' component={Login} />
        </div>
      </BrowserRouter>

    );
  }
}

export default App;
