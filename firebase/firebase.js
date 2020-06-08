var firebase = require('firebase');

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

class Firebase{
    constructor() {

        firebase.initializeApp(firebaseConfig);
      }
      test(){
          return("Hello");
      }
      login(){
          
      }
      register(registerEmail, registerPassword){

        firebase.auth().createUserWithEmailAndPassword(registerEmail, registerPassword)
    
        .then(
          (userData)=> {
            //FIXME WHY DOESN'T (user) => {} work anymore?
            // userData.user.sendEmailVerification();
            firebase.auth().currentUser.sendEmailVerification();
            
          }
          )
            .then(window.location.replace('/'))
        .catch( (error) => {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // [START_EXCLUDE]
          if (errorCode === 'auth/weak-password') {
            alert('The password is too weak.');
          } else {
            alert(errorMessage);
          }
          console.log(error);
          // [END_EXCLUDE]
        });
      }
      
      verify(){

      }
  }

module.exports = Firebase;
