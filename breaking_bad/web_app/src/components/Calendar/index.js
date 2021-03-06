import React from "react";
import Paper from "@material-ui/core/Paper";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
import {
    Scheduler,
    WeekView,
    Appointments,
    AppointmentForm,
    AppointmentTooltip,
} from '@devexpress/dx-react-scheduler-material-ui';
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { blue } from "@material-ui/core/colors";
import fire from '../../config/Fire';
import { Accordion, Card, Form } from 'react-bootstrap';
import { FaRegSmile, FaRegFrown } from "react-icons/fa";
import './styles.css'
import Navbar from "../../common/Navbar";

const theme = createMuiTheme({ palette: { type: "light", primary: blue } });

const DayScaleCell = (props, func) => (
    <WeekView.DayScaleCell {...props} onClick={() => func(props.startDate)} />
);

const CustomAppointment = ({ style, ...restProps }) => {
    if (restProps.data.title.includes('(Procrastination'))
        return (
            <Appointments.Appointment
                {...restProps}
                style={{ ...style, backgroundColor: "red" }}
                className="procrasination"
            />
        );
    return (
        <Appointments.Appointment
            {...restProps}
            style={style}
            className="CLASS_ROOM3"
        />
    );
};

class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            currUser: fire.auth(),
            data: []    ,
            currentDate: new Date(), // set to today's date by default
            message: '',
            open: false,
            selectedDate: new Date(),
        };
    }

    componentDidMount = () => {
        fire.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user });
                localStorage.setItem('user', user.uid);

                // load data from DB
                let self = this
                let database = fire.database().ref();
                let userId = this.state.user.uid
                database.on("value", function (snapshot) {
                    let scheduleArr = snapshot.val()[userId].schedule
                    self.setState({
                        data: scheduleArr,
                    })
                })
            } else {
                this.setState({ user: null });
                localStorage.removeItem('user')
            }
        });
    }

    changeCurrDate = (date) => {
        this.setState({
            selectedDate: date,
        })
    }

    handleFeedbackChange = (e, idx) => {
        e.preventDefault();
        let newState = Object.assign({}, this.state.data)
        newState[idx].feedback = e.target.value
        this.setState(newState)
    }

    handlePosNegChange = (e, idx) => {
        console.log(e, idx)
        let newState = Object.assign({}, this.state.data)
        newState[idx].isPositive = e
        this.setState(newState)
        let username = fire.auth().currentUser.uid
        const ref = fire.database().ref(username)
        const scheduleRef = ref.child("schedule")
        scheduleRef.set(this.state.data).then((u) => {
            this.setState({
                message: 'Setting has been updated successfully!'
            })
        }).catch((error) => {
            this.setState({
                message: error
            })
        });
    }

    saveFeedback = (e) => {
        e.preventDefault();
        let username = fire.auth().currentUser.uid
        const ref = fire.database().ref(username)
        const scheduleRef = ref.child("schedule")
        scheduleRef.set(this.state.data).then((u) => {
            this.setState({
                message: 'Setting has been updated successfully!'
            })
        }).catch((error) => {
            this.setState({
                message: error
            })
        });
    }


    // base code from the documemtation: https://devexpress.github.io/devextreme-reactive/react/scheduler/docs/guides/editing/
    commitChanges = ({ added, changed, deleted }) => {
        let { data } = this.state;
        let username = fire.auth().currentUser.uid
        const ref = fire.database().ref(username)
        const scheduleRef = ref.child("schedule")
        if (added) {
            const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
            added = {
                ...added,
                startDate: added.startDate.toLocaleString('en'),
                endDate: added.endDate.toLocaleString('en'),
            }
            data = [
                ...data,
                {
                    id: startingAddedId,
                    ...added,
                },
            ];
        }
        if (changed) {
            data = data.map(appointment => (
                changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment));
        }
        if (deleted) {
            data = data.filter(appointment => appointment.id !== deleted);
        }
        scheduleRef.set(data).then((u) => {
            this.setState({
                message: 'Schedule has been updated successfully!'
            })
        }).catch((error) => {
            this.setState({
                message: error
            })
        });
        this.setState({ data });
    }

    addMinutes = (date, minutes) => {
        return new Date(date.getTime() + minutes * 60000);
    }

    addProcrastination = (e, appoinments, startTime, duration, title) => {
        let isSliced = false
        let origAppEndTime = null
        let slicedIdx = null
        let { data } = this.state;
        e.preventDefault()

        // sort by start date
        appoinments.sort(function (a, b) {
            return new Date(a.startDate) - new Date(b.startDate);
        });

        // detect overlapping time
        for (let idx in appoinments) {
            // When the procrastination causes slice in the schedule
            let endTime = this.addMinutes(startTime, duration)
            if (((new Date(appoinments[idx].startDate) <= startTime) && (startTime <= new Date(appoinments[idx].endDate))) ||
                ((new Date(appoinments[idx].startDate) <= startTime) && (endTime <= new Date(appoinments[idx].endDate)))) {
                origAppEndTime = new Date(appoinments[idx].endDate)
                slicedIdx = idx
                isSliced = true
                // edit app
                appoinments[idx] = {
                    ...appoinments[idx],
                    endDate: startTime.toString(),
                }
                break
            } else if (((new Date(appoinments[idx].startDate) >= startTime) && (endTime >= new Date(appoinments[idx].startDate)))) {
                let diff = Math.floor(((endTime - new Date(appoinments[idx].startDate)) / 1000) / 60)
                for (let idx in appoinments) {
                    // if schedule is today and it was ORIGINALLY supposed to happend AFTER procrastination  
                    if ((new Date(appoinments[idx].startDate).getDate() === startTime.getDate()) && (new Date(appoinments[idx].startDate) >= startTime)) {
                        appoinments[idx] = {
                            ...appoinments[idx],
                            startDate: this.addMinutes(new Date(appoinments[idx].startDate), diff).toString(),
                            endDate: this.addMinutes(new Date(appoinments[idx].endDate), diff).toString()
                        }
                    }
                }
            }
        }
        // delay schedule
        for (let idx in appoinments) {
            // if schedule is today and it was ORIGINALLY supposed to happend AFTER procrastination  
            if ((new Date(appoinments[idx].startDate).getDate() === startTime.getDate()) && (new Date(appoinments[idx].startDate) >= startTime)) {
                if (isSliced) {
                    appoinments[idx] = {
                        ...appoinments[idx],
                        startDate: this.addMinutes(new Date(appoinments[idx].startDate), duration).toString(),
                        endDate: this.addMinutes(new Date(appoinments[idx].endDate), duration).toString()
                    }
                }
            }
        }

        let prosEnd = this.addMinutes(startTime, duration)
        const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
        let procrastination = {
            allDay: false,
            endDate: prosEnd.toString(),
            id: startingAddedId,
            startDate: startTime.toString(),
            title: title,
        }

        data = [
            ...data,
            {
                id: startingAddedId,
                ...procrastination,
            },
        ];

        if (isSliced) {
            let sliceDiff = Math.floor(((new Date(origAppEndTime) - startTime) / 1000) / 60)

            let slice = {
                allDay: false,
                endDate: this.addMinutes(prosEnd, sliceDiff).toString(),
                id: startingAddedId,
                startDate: this.addMinutes(startTime, duration).toString(),
                title: appoinments[slicedIdx].title + ' (Delayed)',
            }
            data = [
                ...data,
                {
                    id: startingAddedId + 1,
                    ...slice,
                },
            ];
        }

        this.setState({ data });
    }


    formatDate = (date) => {
        let dateStr = date.toDateString()
        let timeStr = date.toTimeString().split(' ')[0]

        return dateStr + ' ' + timeStr
    }

    render() {
        const { data } = this.state;

        return (
            <div>
                <Navbar />
                <div className="row" style={{ padding: '0.5em' }}>
                    <div className="col-md-9">
                        <h3 style={{ marginBottom: '1.25em', marginTop: '1.25em', textAlign: 'center' }}>Your Schedule</h3>
                        <MuiThemeProvider theme={theme}>
                            <Paper>
                                <Scheduler data={data}>
                                    <ViewState currentDate={this.state.currentDate} />
                                    <EditingState onCommitChanges={this.commitChanges} />
                                    <WeekView
                                        startDayHour={7}
                                        endDayHour={23}
                                        dayScaleCellComponent={e => DayScaleCell(e, this.changeCurrDate)}
                                    />
                                    <Appointments appointmentComponent={CustomAppointment} />
                                    <AppointmentTooltip
                                        showOpenButton
                                        showDeleteButton
                                    />
                                    <AppointmentForm />
                                </Scheduler>
                            </Paper>
                        </MuiThemeProvider>
                    </div>
                    <div className="col-md-3" style={{ textAlign: 'center' }}>

                        <h3 style={{ marginBottom: '1.25em', marginTop: '1.25em', textAlign: 'center' }}>Feedback</h3>
                        <p className="date-header">Date: {this.state.selectedDate.toLocaleDateString()}</p>
                        <Accordion>
                            {
                                this.state.data.map((obj, idx) => {
                                    // filter out the current date schedule
                                    if (new Date(obj.startDate).getDate() === (this.state.selectedDate).getDate()) {
                                        return (
                                            <Card>
                                                <Accordion.Toggle as={Card.Header} eventKey={idx}>
                                                    <span className="glyphicon glyphicon-chevron-down"></span>{obj.title}
                                                </Accordion.Toggle>
                                                <Accordion.Collapse eventKey={idx}>
                                                    <Card.Body>
                                                        <div>
                                                            <p>Start Time: {this.formatDate(new Date(obj.startDate))}</p>
                                                        </div>
                                                        <div>
                                                            <p>End Time: {this.formatDate(new Date(obj.endDate))}</p>
                                                        </div>
                                                        <div>
                                                            <Form style={{ backgroundColor: 'white' }}>
                                                                <Form.Label>Personal Feedback</Form.Label>
                                                                <div className="icon-box" style={{ marginTop: '1em', marginBottom: '1em' }}>
                                                                    <FaRegSmile onClick={(e) => this.handlePosNegChange(true, idx)} className="happy" style={{ color: obj.isPositive === true ? "rgb(33, 175, 64)" : 'black' }} />
                                                                    <FaRegFrown onClick={(e) => this.handlePosNegChange(false, idx)} className="sad" style={{ color: obj.isPositive === false ? "rgb(214, 68, 68)" : 'black' }} />
                                                                </div>
                                                                <Form.Group controlId="exampleForm.ControlTextarea1">
                                                                    <Form.Label>Note</Form.Label>
                                                                    <Form.Control onChange={(e) => this.handleFeedbackChange(e, idx)} value={obj.feedback} as="textarea" rows="3" />
                                                                </Form.Group>
                                                                <button type="submit" onClick={this.saveFeedback} className="btn btn-primary">Save Note</button>
                                                            </Form>
                                                        </div>
                                                    </Card.Body>
                                                </Accordion.Collapse>
                                            </Card>

                                        )
                                    } else {
                                        return <div />
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

export default Calendar;
