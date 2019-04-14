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

    updateCalenderDB = (e) => {
        e.preventDefault();
        let username = fire.auth().currentUser.uid
        const ref = fire.database().ref(username)
        const scheduleObj = {
            message: 'test'

        }
        ref.set(scheduleObj).then((u) => {
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
            scheduleRef.set(data).then((u) => {
                this.setState({
                    message: 'Schedule has been updated successfully!'
                })
            }).catch((error) => {
                this.setState({
                    message: error
                })
            });
        }
        if (changed) {
            data = data.map(appointment => (
                changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment));
        }
        if (deleted) {
            data = data.filter(appointment => appointment.id !== deleted);
        }
        this.setState({ data });
        

    }

    render() {
        const { data, currentDate } = this.state;

        return (
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
        );
    }
}

export default Calendar;
