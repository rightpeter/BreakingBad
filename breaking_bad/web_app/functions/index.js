const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
// // Create and Deploy Your First Cloud Functions - All runs in the Firebase Server, not in the Browser
// // https://firebase.google.com/docs/functions/write-firebase-functions


const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
}

exports.addProcrastination = functions.database.ref('/{uid}/ignore')
    .onCreate((snapshotIgnore, context) => {

        let isSliced = false
        let origAppEndTime = null
        let slicedIdx = null
        
        const ignoreData = snapshotIgnore.val()
        const endTime = new Date(ignoreData.endTime)
        const website = ignoreData.website

        const uid = context.params.uid;

        admin.database().ref(`/${uid}/config`)
            .once('value', snapshotConfig => {

                const duration = snapshotConfig.val().sec_timeout
                const startTime = addMinutes(new Date(endTime), -duration)

                admin.database().ref(`/${uid}/schedule`)
                .once('value', snapshotSchedule => {

                    let appoinments = snapshotSchedule.val()

                    // sort by start date
                    appoinments.sort(function (a, b) {
                        return new Date(a.startDate) - new Date(b.startDate);
                    });
    
                    // detect overlapping time
                    for (let idx in appoinments) {
                        // When the procrastination causes slice in the schedule
                        let endTime = addMinutes(startTime, duration)
                        if (((new Date(appoinments[idx].startDate) <= startTime) && (startTime <= new Date(appoinments[idx].endDate))) ||
                            ((new Date(appoinments[idx].startDate) <= startTime) && (endTime <= new Date(appoinments[idx].endDate)))) {
                            origAppEndTime = new Date(appoinments[idx].endDate)
                            slicedIdx = idx
                            isSliced = true
                            // edit app
                            appoinments[idx] = {
                                allDay: appoinments[idx].allDay,
                                endDate: startTime.toLocaleString('en'),
                                id: appoinments[idx].id,
                                startDate: appoinments[idx].startDate,
                                title: appoinments[idx].title,
                            }
                            break
                        } else if (((new Date(appoinments[idx].startDate) >= startTime) && (endTime >= new Date(appoinments[idx].startDate)))) {
                            let diff = Math.floor(((endTime - new Date(appoinments[idx].startDate)) / 1000) / 60)
                            for (let idx in appoinments) {
                                // if schedule is today and it was ORIGINALLY supposed to happend AFTER procrastination  
                                if ((new Date(appoinments[idx].startDate).getDate() === startTime.getDate()) && (new Date(appoinments[idx].startDate) >= startTime)) {
                                    appoinments[idx] = {
                                        allDay: appoinments[idx].allDay,
                                        endDate: addMinutes(new Date(appoinments[idx].endDate), diff).toLocaleString('en'),
                                        id: appoinments[idx].id,
                                        startDate: addMinutes(new Date(appoinments[idx].startDate), diff).toLocaleString('en'),
                                        title: appoinments[idx].title,
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
                                    allDay: appoinments[idx].allDay,
                                    endDate: addMinutes(new Date(appoinments[idx].endDate), duration).toLocaleString('en'),
                                    id: appoinments[idx].id,
                                    startDate: addMinutes(new Date(appoinments[idx].startDate), duration).toLocaleString('en'),
                                    title: appoinments[idx].title,
                                }
                            }
                        }
                    }

                    let prosEnd = endTime

                    let procrastination = {
                        allDay: false,
                        endDate: prosEnd.toLocaleString('en'),
                        id: Math.random(),
                        startDate: startTime.toLocaleString('en'),
                        title: website + ' ' + '(Procrastination)',
                    }

                    appoinments = [
                        ...appoinments,
                        procrastination
                    ]

                    if (isSliced) {
                        let sliceDiff = Math.floor(((new Date(origAppEndTime) - startTime) / 1000) / 60)
                        let sliceID = Math.random()
                        let slice = {
                            allDay: false,
                            endDate: addMinutes(prosEnd, sliceDiff).toLocaleString('en'),
                            id: sliceID,
                            startDate: addMinutes(startTime, duration).toLocaleString('en'),
                            title: appoinments[slicedIdx].title + ' (Delayed)',
                        }

                        appoinments = [
                            ...appoinments,
                            slice
                        ]
                    
                    
                    }

                    const finalAppointments = appoinments;

                    // update DB
                    return snapshotIgnore.ref.parent.child('schedule').set(finalAppointments);
                })
                // return snapshotConfig.val() //snapshotIgnore.ref.parent.child('schedule').set(scheduleArr);
            })

        return null;
});

exports.addProcrastinationOnUpdate = functions.database.ref('/{uid}/ignore')
    .onUpdate((change, context) => {

        // change object 
        let isSliced = false
        let origAppEndTime = null
        let slicedIdx = null
        
        const ignoreData = change.after.val()
        const endTime = new Date(ignoreData.endTime)
        let website = change.after.val().websites

        if (website === undefined) {
            website = change.before.val().websites
        }

        const uid = context.params.uid;

        admin.database().ref(`/${uid}/config`)
            .once('value', snapshotConfig => {

                const duration = snapshotConfig.val().sec_timeout
                const startTime = addMinutes(new Date(endTime), -duration)

                admin.database().ref(`/${uid}/schedule`)
                .once('value', snapshotSchedule => {

                    let appoinments = snapshotSchedule.val()

                    // sort by start date
                    appoinments.sort(function (a, b) {
                        return new Date(a.startDate) - new Date(b.startDate);
                    });
    
                    // detect overlapping time
                    for (let idx in appoinments) {
                        // When the procrastination causes slice in the schedule
                        let endTime = addMinutes(startTime, duration)
                        if (((new Date(appoinments[idx].startDate) <= startTime) && (startTime <= new Date(appoinments[idx].endDate))) ||
                            ((new Date(appoinments[idx].startDate) <= startTime) && (endTime <= new Date(appoinments[idx].endDate)))) {
                            origAppEndTime = new Date(appoinments[idx].endDate)
                            slicedIdx = idx
                            isSliced = true
                            // edit app
                            appoinments[idx] = {
                                allDay: appoinments[idx].allDay,
                                endDate: startTime.toLocaleString('en'),
                                id: appoinments[idx].id,
                                startDate: appoinments[idx].startDate,
                                title: appoinments[idx].title,
                            }
                            break
                        } else if (((new Date(appoinments[idx].startDate) >= startTime) && (endTime >= new Date(appoinments[idx].startDate)))) {
                            let diff = Math.floor(((endTime - new Date(appoinments[idx].startDate)) / 1000) / 60)
                            for (let idx in appoinments) {
                                // if schedule is today and it was ORIGINALLY supposed to happend AFTER procrastination  
                                if ((new Date(appoinments[idx].startDate).getDate() === startTime.getDate()) && (new Date(appoinments[idx].startDate) >= startTime)) {
                                    appoinments[idx] = {
                                        allDay: appoinments[idx].allDay,
                                        endDate: addMinutes(new Date(appoinments[idx].endDate), diff).toLocaleString('en'),
                                        id: appoinments[idx].id,
                                        startDate: addMinutes(new Date(appoinments[idx].startDate), diff).toLocaleString('en'),
                                        title: appoinments[idx].title,
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
                                    allDay: appoinments[idx].allDay,
                                    endDate: addMinutes(new Date(appoinments[idx].endDate), duration).toLocaleString('en'),
                                    id: appoinments[idx].id,
                                    startDate: addMinutes(new Date(appoinments[idx].startDate), duration).toLocaleString('en'),
                                    title: appoinments[idx].title,
                                }
                            }
                        }
                    }

                    let prosEnd = endTime

                    let procrastination = {
                        allDay: false,
                        endDate: prosEnd.toLocaleString('en'),
                        id: Math.random(),
                        startDate: startTime.toLocaleString('en'),
                        title: website + ' ' + '(Procrastination)',
                    }

                    appoinments = [
                        ...appoinments,
                        procrastination
                    ]

                    if (isSliced) {
                        let sliceDiff = Math.floor(((new Date(origAppEndTime) - startTime) / 1000) / 60)
                        let sliceID = Math.random()
                        let slice = {
                            allDay: false,
                            endDate: addMinutes(prosEnd, sliceDiff).toLocaleString('en'),
                            id: sliceID,
                            startDate: addMinutes(startTime, duration).toLocaleString('en'),
                            title: appoinments[slicedIdx].title + ' (Delayed)',
                        }

                        appoinments = [
                            ...appoinments,
                            slice
                        ]
                    
                    
                    }

                    const finalAppointments = appoinments;

                    // update DB
                    return change.after.ref.parent.child('schedule').set(finalAppointments);
                })
                // return snapshotConfig.val() //snapshotIgnore.ref.parent.child('schedule').set(scheduleArr);
            })

        return null;
});