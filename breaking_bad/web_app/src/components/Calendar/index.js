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
    subtractMinutes = (date, minutes) => {
        return new Date(date.getTime() - minutes * 60000);
    }
    
    addProcrastination = (e, appoinments,startTime, duration, title) => {

        let origAppEndTime = null
        let slicedIdx = null
        let { data } = this.state;
        e.preventDefault()

        // sort by start date
        appoinments.sort(function(a,b) {
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
                // edit app
                appoinments[idx] = {
                    ...appoinments[idx],
                    endDate: startTime.toString(),
                }
                break
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

        let sliceDiff = Math.floor(((new Date(origAppEndTime) - startTime) / 1000) / 60)

        let slice = {
            allDay: false,
            endDate: this.addMinutes(prosEnd, sliceDiff),
            id: startingAddedId,
            startDate: this.addMinutes(startTime, duration).toString(),
            title: appoinments[slicedIdx].title + ' (Delayed)',
        }

        // delay schedule
        for (let idx in appoinments) {
            // if schedule is today and it was ORIGINALLY supposed to happend AFTER procrastination  
            if ((new Date(appoinments[idx].startDate).getDate() === startTime.getDate()) && (new Date(appoinments[idx].startDate) >= startTime)) {
                appoinments[idx] = {
                    ...appoinments[idx],
                    startDate: this.addMinutes(new Date(appoinments[idx].startDate), duration).toString(),
                    endDate: this.addMinutes(new Date(appoinments[idx].endDate), duration).toString()
                }
            }
        }

        data = [
            ...data,
            {
                id: startingAddedId,
                ...procrastination,
            },
        ];
        data = [
            ...data,
            {
                id: startingAddedId + 1,
                ...slice,
            },
        ];
        this.setState({ data });
    }

    render() {
        const { data, currentDate } = this.state;
        const startTime = new Date("Mon Apr 15 2019 12:45:00")
        const duration = 30
        console.log('data', data)
        return (
            <div>
                <h2 style={{marginBottom: '1.25em', marginTop: '1.25em', textAlign: 'center'}}>Your Schedule</h2>
                <center>
                    <button onClick={(e) => this.addProcrastination(e, data, startTime, duration, 'Procrastination')}>Test Add Procrastination (Procrastinate from 12:45 PM to 1:15 PM)</button>
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
