import React, { Component } from 'react';
import './styles.css';
import { Link } from 'react-router-dom';

class Main extends Component {

    render() {
        return (
            <div className="row center">
              <div className="col-md-12" style={{ padding: '3.5em' }}>
                <div>
                  <h1 style={{ fontSize: '3.8em', marginBottom: '0.8em' }}>Breaking Bad Habits</h1>
                  <p style={{ fontSize: '1.5em', padding: '0.5em' }}>Habits are routines, triggered by cues in hopes of a reward. Often, it is difficult to avoid the cue or change the routine. Our survey of personal tracking tools suggests that although they assist users in gathering data about their behaviour, very few can help users get through moments of temptation or an activity they would like to avoid without giving in.</p>
                </div>
                <div>
                  <p style={{ fontSize: '1.5em', padding: '0.5em' }}>Research shows that the more people can associate with their future selves, the more willing individuals are to wait for future rewards. When a user is tempted by an activity they would like to avoid, we propose gently reminding them that their future self is the same current self who will have to deal with the consequences of their actions e.g. showing procrastinators their own slightly aged, tired face and a packed future calendar.</p>
                </div>
                <Link style={{ textDecoration: 'none' }} to="/config"><button style={{ backgroundColor: '#55acf3', borderColor: '#55acf3' }} className="home-button btn btn-primary" onClick={this.reset}>Configure my Habits</button></Link>
              </div>
            </div>
        );
    }
}
export default Main;