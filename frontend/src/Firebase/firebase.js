import firebase from 'firebase';
import axios from 'axios';


const firebaseConfig = {
  apiKey: "AIzaSyC9sBHK-evjecmuWQsQHoE-iSJmHUcIBcE",
  authDomain: "eumyth-65330.firebaseapp.com",
  databaseURL: "https://eumyth-65330.firebaseio.com",
  projectId: "eumyth-65330",
  storageBucket: "eumyth-65330.appspot.com",
  messagingSenderId: "677080457179",
  appId: "1:677080457179:web:5e1e38f3f082f93427d1fe",
  measurementId: "G-GP77M3QKXG"
};

class Firebase {
  constructor() {
    firebase.initializeApp(firebaseConfig);
    this.auth = firebase.auth();
    this.db = firebase.database();
    this.doTest = this.doTest.bind(this);
    this.doCreateUser = this.doCreateUser.bind(this);
    this.doSignIn = this.doSignIn.bind(this);
    this.doSignOut = this.doSignOut.bind(this);
    this.doSendEmailVerification = this.doSendEmailVerification.bind(this);
    this.doPasswordReset = this.doPasswordReset.bind(this);
    this.doPasswordUpdate = this.doPasswordUpdate.bind(this);
    this.doIsEmailVerified = this.doIsEmailVerified.bind(this);
    this.checkExistingUser = this.checkExistingUser.bind(this);
    this.writeBasicUserData = this.writeBasicUserData.bind(this);
  }

  doTest() {
    return ("FIREBASE");
  }

  doCreateUser(email, password) {
    return this.auth.createUserWithEmailAndPassword(email, password)
      .then(
        (userData) => {
          userData.user.sendEmailVerification();
        }
      )
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          return (errorMessage);
        }
        console.log(error);
      });
  }

  doSignIn(email, password) {
    return this.auth.signInWithEmailAndPassword(email, password)
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorMessage) alert(errorMessage);
      }
      );
  }

  doSignOut() {
    return this.auth.signOut();
  }

  doSendEmailVerification() {
    this.auth.currentUser.sendEmailVerification()
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode === 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          console.log(errorMessage);
        }
        console.log(error);
      });
  }
  doPasswordReset(email) {
    alert("EMAIL");
    return this.auth.sendPasswordResetEmail(email);
  }

  doPasswordUpdate(password) {
    return this.auth.currentUser.updatePassword(password);
  }

  returnUsername() {
    if (this.auth.currentUser) {
      return this.auth.currentUser.displayName;
    }
  } 

  doUsernameUpdate(username) {
    return this.auth.currentUser.updateProfile({displayName: username});
  }

  doIsEmailVerified() {
    if (this.auth.currentUser) {
      return this.auth.currentUser.emailVerified;
    }
  };

  checkExistingUser() {
    const uid = this.auth.currentUser.uid;
    //read from API
    return this.db.ref('users/' + uid).once('value').then(
      (snapshot) => {
        return snapshot.val();
      }
    )
  }
  writeBasicUserData(username, firstName, lastName) {
    const uid = this.auth.currentUser.uid;
    return this.db.ref('users/' + uid)
      .set({
        username: username,
        firstName: firstName,
        lastName: lastName
      })
      .then(() => uid)
      .catch(err => 'Error: ' + err);
  }
}

export default Firebase;