import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyCSoc86zMDGJjRwTzjTnU2UFKc96VQlVAo",
    authDomain: "breaking-bad-b34cc.firebaseapp.com",
    databaseURL: "https://breaking-bad-b34cc.firebaseio.com",
    projectId: "breaking-bad-b34cc",
    storageBucket: "breaking-bad-b34cc.appspot.com",
    messagingSenderId: "614753134089"
};

const fire = firebase.initializeApp(config);
export default fire;