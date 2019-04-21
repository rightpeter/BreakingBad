const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
// // Create and Deploy Your First Cloud Functions - All runs in the Firebase Server, not in the Browser
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

const createNotification = (notification => {
    return admin.firestore().collection('notifications')
        .add(notification)
        .then(doc => console.log('notification added', doc))
})

exports.creationTest = functions.firestore
    .document('projects/{projectId}')
    .onCreate(doc => {

        const project = doc.date();
        const notification = {
            content: 'Added a new project',
            user: `${project.authorFirstName} ${project.authorLastName}`,
            time: admin.firestore.FieldValue.serverTimestamp()
        }

        return createNotification(notification);
    })

exports.dbTest = functions.database.ref('/test/{id}')
    .onCreate(event => {
        const data = event.val()
        const newData = {
            msg: data.msg.toUpperCase()
        };
        return event.ref.parent.child('copiedData').set(newData);
    })