import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import './styles.css';
import { Accordion, Card, Form } from 'react-bootstrap';

class CollpaseTest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            schedules: [
                { startDate: '2018-10-31 10:00', endDate: '2018-10-31 11:00', title: 'Meeting', id: 0 },
                { startDate: '2018-11-01 18:00', endDate: '2018-11-01 19:30', title: 'Go to a gym', id: 1 },
                { startDate: '2018-12-01 18:00', endDate: '2018-12-02 19:30', title: 'Go to class', id: 2 }
            ]
        };
    }

    render() {
        return (
            <div className="row center">
                <div className="col-md-6">
                    <div>
                        <Accordion defaultActiveKey={1}>
                            {
                                this.state.schedules.map((obj, idx) => {
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
                                                        <Form>
                                                            <Form.Group controlId="exampleForm.ControlTextarea1">
                                                                <Form.Label>Personal Feedback</Form.Label>
                                                                <Form.Control as="textarea" rows="3" />
                                                            </Form.Group>
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