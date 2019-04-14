import React from "react";
import { render } from "react-dom";
import Paper from "@material-ui/core/Paper";
import { ViewState, EditingState } from "@devexpress/dx-react-scheduler";
import {
    Scheduler,
    WeekView,
    DayView,
    Appointments,
    AppointmentForm,
    AppointmentTooltip,
  } from '@devexpress/dx-react-scheduler-material-ui';
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { blue } from "@material-ui/core/colors";
import { appointments } from "./data";

const theme = createMuiTheme({ palette: { type: "light", primary: blue } });

class Calendar extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: appointments,
      currentDate: new Date(),
    };   
    this.commitChanges = this.commitChanges.bind(this);
  }

  // code from the documemtation: https://devexpress.github.io/devextreme-reactive/react/scheduler/docs/guides/editing/
  commitChanges({ added, changed, deleted }) {
    let { data } = this.state;
    if (added) {
      const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
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
