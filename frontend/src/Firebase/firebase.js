import firebase from 'firebase';

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
    this.checkIsExistingUser = this.checkIsExistingUser.bind(this);
    this.writeBasicUserData = this.writeBasicUserData.bind(this);
  }

  doTest() {
    return ("FIREBASE");
  }

  //yes
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

  //yes
  doSignIn(email, password) {
    return this.auth.signInWithEmailAndPassword(email, password)
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorMessage) alert(errorCode + " " + errorMessage);
      }
      );
  }

  //yes
  doSignOut() {
    return this.auth.signOut();
  }

  //yes
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
  //yes
  doPasswordReset(email) {
    alert("EMAIL");
    return this.auth.sendPasswordResetEmail(email);
  }

  //yes
  doPasswordUpdate(password) {
    return this.auth.currentUser.updatePassword(password);
  }

  //yes
 returnUsername() {
      return this.auth.currentUser.displayName;
  } 

  //yes
  doUsernameUpdate(username) {
    return this.auth.currentUser.updateProfile({displayName: username})
    .then(() => 200)
    ;
  }

  //yes
  doIsEmailVerified() {
    if (this.auth.currentUser) {
      return this.auth.currentUser.emailVerified;
    }
  };

  //yes
  checkIsExistingUser() {
    const uid = this.auth.currentUser.uid;
    //read from API
    return this.db.ref('users/' + uid).once('value').then(
      (snapshot) => {
        return snapshot.val();
      }
    )
  }

  //yes
  returnName(){
    const uid = this.auth.currentUser.uid;
    //read from API
    return this.db.ref('users/' + uid).once('value').then(
      (snapshot) => {
        return snapshot.val();
      }
    )
  }

  //yes
  writeBasicUserData(username, firstName, lastName) {
    const uid = this.auth.currentUser.uid;
    return this.db.ref('users/' + uid)
      .set({
        username: username,
        firstName: firstName,
        lastName: lastName
      })
      .then(() => 200)
  }
}

export default Firebase;