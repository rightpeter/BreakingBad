import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import fire from '../../config/Fire';
import './styles.css';

class UserConfig extends Component {
    constructor(props) {
        super(props);
        this.reset = this.reset.bind(this);
        this.state = {
            user: {},
            websites: [],
            entertainments: [],
            first_timeout: 0,
            sec_timeout: 0,
            message: '',
        };
    }

    // Load config info from DB
    componentDidMount = () => {
        fire.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user });
                localStorage.setItem('user', user.uid);

                let self = this
                let database = fire.database().ref();
                let uid = fire.auth().currentUser.uid
                database.on("value", function (snapshot) {
                    let websitesDB = snapshot.val()[uid].config.websites
                    let first_timeoutDB = snapshot.val()[uid].config.first_timeout
                    let sec_timeoutDB = snapshot.val()[uid].config.sec_timeout
                    self.setState({
                        websites: websitesDB,
                        first_timeout: first_timeoutDB,
                        sec_timeout: sec_timeoutDB,
                    })
                })

            } else {
                this.setState({ user: null });
                localStorage.removeItem('user')
            }
        });
    }

    addConfigToDB = (e) => {
        e.preventDefault();
        let username = fire.auth().currentUser.uid
        const ref = fire.database().ref(username).child("config")
        const webObj = {
            websites: this.state.websites,
            first_timeout: parseInt(this.state.first_timeout),
            sec_timeout: parseInt(this.state.sec_timeout),
        }
        ref.set(webObj).then((u) => {
            this.setState({
                message: 'Setting has been updated successfully!'
            })
        }).catch((error) => {
            this.setState({
                message: error
            })
        });
    }

    addWebsites = (e) => {
        e.preventDefault();
        this.setState({
            websites: [...this.state.websites, ""]
        })
    }   

    handleWebsiteChange = (e, idx) => {
        e.preventDefault();
        this.state.websites[idx] = e.target.value;
        this.setState({
            websites: this.state.websites,
        })
    }

    handleRemove = (e, idx) => {
        e.preventDefault();
        this.state.websites.splice(idx, 1)
        this.setState({
            websites: this.state.websites,
        })
    }

    reset(e) {
        e.preventDefault();
        this.setState({
            websites: [],
            entertainments: [],
            first_timeout: 0,
            sec_timeout: 0,
        })
    }

    render() {
        return (
            <div className="row center">
                <div className="col-md-6">
                    <h1>Bad Habit Setting</h1>
                    <p className="message">{this.state.message}</p>
                    <form className="form-style">
                        <div className="form-group">
                            <label style={{ display: "inherit" }}>Add Bothering Websites</label>
                            {
                                this.state.websites.map((url, idx) => {
                                    return (
                                        <div key={idx}>
                                            <input style={{ marginRight: '.5em', width: "90%", display: "inline" }} className="form-control" onChange={(e) => this.handleWebsiteChange(e, idx)} value={url} />
                                            <button className="btn btn-danger" onClick={(e) => this.handleRemove(e, idx)}>X</button>
                                        </div>
                                    )
                                })
                            }
                            <button className="btn btn-primary margin-top" onClick={(e) => this.addWebsites(e)}>+</button>
                        </div>
                        <div className="form-group">
                            <label for="exampleInputEmail1">First Timeout (seconds)</label>
                            <input value={this.state.first_timeout} onChange={e => this.setState({ first_timeout: e.target.value })} type="number" name="first-timeout" className="form-control" id="first_timeout" aria-describedby="emailHelp" placeholder="Enter First Timeout (seconds)" />
                        </div>
                        <div className="form-group">
                            <label for="exampleInputEmail1">Second Timeout (seconds)</label>
                            <input value={this.state.sec_timeout} onChange={e => this.setState({ sec_timeout: e.target.value })} type="number" name="sec-timeout" className="form-control" id="sec_timeout" aria-describedby="emailHelp" placeholder="Enter Second Timeout (seconds)" />
                        </div>
                        <button type="submit" onClick={this.addConfigToDB} className="btn btn-primary">Confirm Settings</button>
                        <button onClick={this.reset} style={{ marginLeft: '25px' }} className="btn btn-success">Reset</button>
                    </form>
                </div>
            </div>


        );
    }
}
export default UserConfig;