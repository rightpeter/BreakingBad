import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import { Accordion, Card, Form } from 'react-bootstrap';
import './styles.css'
import fire from '../../config/Fire';


class CollpaseTest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            schedules: [],
            todaySchedules: [], // filtered by curr date
            userId: fire.auth().currentUser.uid,
            selectedDate: new Date(),
        };
    }
    
    componentDidMount = () => {
        // load data from DB
        let self = this
        let database = fire.database().ref();
        let userId = this.state.userId
        database.on("value", function (snapshot) {
            let scheduleArr = snapshot.val()[userId].schedule
            self.setState({
                schedules: scheduleArr,
            })
        })
    }

    handleFeedbackChange = (e, idx) => {
        e.preventDefault();
        let newState = Object.assign({}, this.state.schedules)
        newState[idx].feedback = e.target.value
        this.setState(newState)

    }

    saveFeedback = (e) => {
        e.preventDefault();

        let username = fire.auth().currentUser.uid
        const ref = fire.database().ref(username)
        const scheduleRef = ref.child("schedule")
        scheduleRef.set(this.state.schedules).then((u) => {
            this.setState({
                message: 'Setting has been updated successfully!'
            })
        }).catch((error) => {
            this.setState({
                message: error
            })
        });

    }

    render() {
        console.log('sate', this.state.todaySchedules)
        return (
            <div className="row center">
                <div className="col-md-6">
                    <span className="date-header">Date: {this.state.selectedDate.getDate()}</span>
                    <div>
                        <Accordion defaultActiveKey={0}>
                            {
                                this.state.schedules.map((obj, idx) => {
                                    // filter out the current date schedule
                                    if (new Date(obj.startDate).getDate() === this.state.selectedDate.getDate()) {
                                        return (
                                            <Card>
                                                <Accordion.Toggle as={Card.Header} eventKey={idx}>
                                                <span class="glyphicon glyphicon-chevron-down"></span>{obj.title}
                                                </Accordion.Toggle>
                                                <Accordion.Collapse eventKey={idx}>
                                                    <Card.Body>
                                                        <div>
                                                            <p>Start Time: {obj.startDate}</p>
                                                        </div>
                                                        <div>
                                                            <p>End Time: {obj.endDate}</p>
                                                        </div>
                                                        <div>
                                                            <Form className="none-style">
                                                                <Form.Group controlId="exampleForm.ControlTextarea1">
                                                                    <Form.Label>Personal Feedback</Form.Label>
                                                                    <Form.Control onChange={(e) => this.handleFeedbackChange(e, idx)} value={obj.feedback} as="textarea" rows="3" />
                                                                </Form.Group>
                                                                <button type="submit" onClick={this.saveFeedback} className="btn btn-primary">Save Feedback</button>
                                                            </Form>
                                                        </div>
                                                    </Card.Body>
                                                </Accordion.Collapse>
                                            </Card>
    
                                        )
                                    } else {
                                        return <div/>
                                    }
                                })
                            }
                        </Accordion>
                    </div>
                </div>
            </div>
        );
    }
}
export default CollpaseTest;