import * as firebaseui from 'firebaseui';

const config = ({
  // your config
})

// This is our firebaseui configuration object
const uiConfig = ({
  signInSuccessUrl: '/',
  signInOptions: [
    window.firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  tosUrl: '/terms-of-service' // This doesn't exist yet
})

// This must run before any other firebase functions
window.firebase.initializeApp(config)

// This sets up firebaseui
const ui = new firebaseui.auth.AuthUI(window.firebase.auth())

// This adds firebaseui to the page
// It does everything else on its own
const startFirebaseUI = function (elementId) {
  ui.start(elementId, uiConfig)
};

export startFirebaseUI;