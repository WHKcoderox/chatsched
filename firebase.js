// Initialize Firebase -={ start }=-
import * as firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyBuEiUhG9beGTTh697WtZBemQLSL9Ocn8A",
    authDomain: "chattersched.firebaseapp.com",
    databaseURL: "https://chattersched.firebaseio.com",
    projectId: "chattersched",
    storageBucket: "chattersched.appspot.com",
    messagingSenderId: "328961643249"
};
firebase.initializeApp(firebaseConfig);

export default firebase;
// Initialize Firebase -={ end }=-