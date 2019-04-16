import React, { Component } from "react";
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
import { appointments } from "./data";
import fire from '../../config/Fire';

const theme = createMuiTheme({ palette: { type: "light", primary: blue } });

class Calendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: fire.auth().currentUser.uid,
            data: appointments,
            currentDate: new Date(), // set to today's date by default
            message: '',
        };
    }

    componentDidMount = () => {
        let self = this
        let database = fire.database().ref();
        let userId = this.state.userId
        database.on("value", function(snapshot) {
            let scheduleArr = snapshot.val()[userId].schedule
            self.setState({
                data: scheduleArr,
            })
        })
    }

    // base code from the documemtation: https://devexpress.github.io/devextreme-reactive/react/scheduler/docs/guides/editing/
    commitChanges = ({ added, changed, deleted }) => {
        let { data } = this.state;
        let username = fire.auth().currentUser.uid
        let scheduleObj = this.state.data;
        const ref = fire.database().ref(username)
        const scheduleRef = ref.child("schedule")
        if (added) {
            const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
            added = {
                ...added,
                startDate: added.startDate.toString(),
                endDate: added.endDate.toString(),
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
        console.log(data)

    }

    addMinutes = (date, minutes) => {
        return new Date(date.getTime() + minutes * 60000);
    }
    
    addProcrastination = (e, appoinments,startTime, duration, title) => {

        let { data } = this.state;
        e.preventDefault()
        console.log(appoinments)
        console.log('start', startTime, 'duration', duration)
        // detect overlapping time
        for (let idx in appoinments) {
            console.log('app', appoinments[idx])
            if (new Date(appoinments[idx].startDate) <= startTime && startTime <= new Date(appoinments[idx].endDate)) {
                console.log('overlapping', idx)
                let newStartDate = this.addMinutes(startTime, duration)
                let diff = new Date(appoinments[idx].endDate) - new Date(appoinments[idx].startDate)
                let newEndDate = this.addMinutes(newStartDate, Math.floor((diff/1000)/60))
                // edit app
                appoinments[idx] = {
                    ...appoinments[idx],
                    startDate: newStartDate.toString(),
                    endDate: newEndDate.toString(),
                }
                console.log('new app', appoinments)
                break
            }
        }
        const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
        let procrastination = {
            allDay: false,
            endDate: this.addMinutes(startTime, duration),
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
        this.setState({ data });
        console.log('fin data', data)
    }

    render() {
        const { data, currentDate } = this.state;
        const startTime = new Date("Mon Apr 15 2019 11:20:00")
        const duration = 20
        console.log('data', data)
        return (
            <div>
                <h2 style={{marginBottom: '1.25em', marginTop: '1.25em', textAlign: 'center'}}>Your Schedule</h2>
                <center>
                    <button onClick={(e) => this.addProcrastination(e, data, startTime, duration, 'Procrastination')}>Test Add Procrastination</button>
                </center>
                <MuiThemeProvider theme={theme}>
                    <Paper>
                        <Scheduler data={data}>
                            <ViewState currentDate={currentDate} />
                            <EditingState onCommitChanges={this.commitChanges} />
                            <WeekView startDayHour={9} endDayHour={19} />
                            <Appointments />
                            <AppointmentTooltip
                                showOpenButton
                                showDeleteButton
                            />
                            <AppointmentForm />
                        </Scheduler>
                    </Paper>
                </MuiThemeProvider>
            </div>
        );
    }
}

export default Calendar;
