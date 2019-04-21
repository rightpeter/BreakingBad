const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
// // Create and Deploy Your First Cloud Functions - All runs in the Firebase Server, not in the Browser
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.dbTest = functions.database.ref('/{uid}/ignore')
    .onUpdate((change, context) => {

        const before = change.before.val()
        const after = change.after.val()

        //  if (before.text === after.text) {
        //      return null
        //  }

        return null; // change.after.ref.child('new').set('dddddd')

    });

const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
}

exports.dbTest2 = functions.database.ref('/{uid}/ignore')
    .onCreate((snapshotIgnore, context) => {

        let isSliced = false
        let origAppEndTime = null
        let slicedIdx = null
        
        const ignoreData = snapshotIgnore.val()
        const endTime = new Date(ignoreData.endTime)
        const website = ignoreData.website

        console.log('ignore', ignoreData, endTime, website)

        const uid = context.params.uid;

        admin.database().ref(`/${uid}/config`)
            .once('value', snapshotConfig => {

                console.log('retrieved data', ignoreData, endTime, website, snapshotConfig.val().sec_timeout)
                
                const duration = snapshotConfig.val().sec_timeout // minute (int)
                const startTime = addMinutes(new Date(endTime), -duration)
                console.log('startTime', startTime)
                admin.database().ref(`/${uid}/schedule`)
                .once('value', snapshotSchedule => {

                    console.log(snapshotSchedule);
                    console.log(snapshotSchedule.val());
                    console.log(snapshotSchedule.val()[0]);
    
                    let appoinments = snapshotSchedule.val()
                    console.log('BEFORE', appoinments)
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
                                    /*appoinments[idx] = {
                                        ...appoinments[idx],
                                        startDate: this.addMinutes(new Date(appoinments[idx].startDate), diff).toString(),
                                        endDate: this.addMinutes(new Date(appoinments[idx].endDate), diff).toString()
                                    }*/
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

                    let prosEnd = endTime //addMinutes(startTime, duration)
                    const startingAddedId = appoinments.length > 0 ? appoinments[appoinments.length - 1].id + 1 : 0;
                    let procrastination = {
                        allDay: false,
                        endDate: prosEnd.toLocaleString('en'),
                        id: startingAddedId,
                        startDate: startTime.toLocaleString('en'),
                        title: website + ' ' + '(Procrastination)',
                    }

                    /*data = [
                        ...data,
                        {
                            id: startingAddedId,
                            ...procrastination,
                        },
                    ];*/

                    appoinments = [
                        ...appoinments,
                        procrastination
                    ]
                    console.log('procrastination', procrastination)
                    if (isSliced) {
                        let sliceDiff = Math.floor(((new Date(origAppEndTime) - startTime) / 1000) / 60)

                        let slice = {
                            allDay: false,
                            endDate: addMinutes(prosEnd, sliceDiff).toLocaleString('en'),
                            id: startingAddedId,
                            startDate: addMinutes(startTime, duration).toLocaleString('en'),
                            title: appoinments[slicedIdx].title + ' (Delayed)',
                        }
                        console.log('SLICE', slice)
                        /*data = [
                            ...data,
                            {
                                id: startingAddedId + 1,
                                ...slice,
                            },
                        ];*/

                        appoinments = [
                            ...appoinments,
                            slice
                        ]
                    
                    
                    }
                    console.log('AFTER', appoinments)
                    
                    const finalAppointments = appoinments;

                    // update DB
                    return snapshotIgnore.ref.parent.child('schedule').set(finalAppointments);
                })
                // return snapshotConfig.val() //snapshotIgnore.ref.parent.child('schedule').set(scheduleArr);
            })

        /*
        
        */
        /* let scheduleArr = [
            {

                allDay: false,
                endDate: new Date().toString(),
                id: 100,
                startDate: new Date().toString(),
                title: 'test'

            }
        ]

        scheduleArr = [
            ...scheduleArr,
            {
                allDay: false,
                endDate: new Date().toString(),
                id: 200,
                startDate: new Date().toString(),
                title: 'test2'

            }
        ]; */

        return null;
});