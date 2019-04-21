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

exports.dbTest2 = functions.database.ref('/{uid}/ignore')
    .onCreate((snapshotIgnore, context) => {

        const uid = context.params.uid;

        admin.database().ref(`/${uid}/schedule`)
            .once('value', snapshotSchedule => {
                console.log(snapshotSchedule);
                console.log(snapshotSchedule.val());
                console.log(snapshotSchedule.val()[0]);




                return snapshotSchedule.val() //snapshotIgnore.ref.parent.child('schedule').set(scheduleArr);
            }).then(scheduleObj => {
                console.log('scheduleObj', scheduleObj)
            });

        let scheduleArr = [
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
        ];

        return snapshotIgnore.ref.parent.child('schedule').set(scheduleArr);
});