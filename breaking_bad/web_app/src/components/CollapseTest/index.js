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
        let self = this
        let database = fire.database().ref();
        let userId = this.state.userId
        database.on("value", function (snapshot) {
            let scheduleArr = snapshot.val()[userId].schedule


            self.setState({
                schedules: scheduleArr,
            })

            // filter by current date (chosen date)
            let filteredSchedule = []

            for (let idx in self.state.schedules) {
                if (new Date(self.state.schedules[idx].startDate).getDate() === self.state.selectedDate.getDate()) {
                    filteredSchedule.push(self.state.schedules[idx])
                }
            }
            
            self.setState({
                todaySchedules: filteredSchedule,
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
        console.log(this.state.schedules)
        
        let username = fire.auth().currentUser.uid
        const ref = fire.database().ref(username)
        const scheduleRef = ref.child("schedule")
        scheduleRef.set(this.state.schedules).then((u) => {
            console.log('Setting has been updated successfully!')
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
        console.log('sate', this.state.schedules)
        return (
            <div className="row center">
                <div className="col-md-6">
                    <span className="date-header">Date: {this.state.selectedDate.getDate()}</span>
                    <div>
                        <Accordion defaultActiveKey={1}>
                            {
                                this.state.todaySchedules.map((obj, idx) => {
                                    return (
                                        <Card>
                                            <Accordion.Toggle as={Card.Header} eventKey={idx}>
                                                {obj.title}
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