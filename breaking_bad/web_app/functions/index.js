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
    .onCreate((snapshot, context) => {

        const uid = context.params.uid
        console.log(`Current User ${uid}`)

        // Data added at the location
        const ignoreData = snapshot.val()
        const endTime = new Date(ignoreData.endTime).toString()

        // ref matches `/{uid}/ignore`
        return snapshot.ref.update({ endTime: endTime})

    });