import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import WelcomePage from './Components/welcome/welcome';
import InitialCustomizationPage from './Components/initial-customization/initial-customization';
import './App.scss';
import { FirebaseContext } from './Firebase';


function App() {
  console.log("APP");
  return (
    <Router>
      <div className="container">
        <Route exact path="/" render={
          () =>
            <FirebaseContext.Consumer>
              {(props) => (
                <WelcomePage firebase={props} />
              )}
            </FirebaseContext.Consumer>
        }
        />
           <Route exact path="/test" render={
          () =>
            <FirebaseContext.Consumer>
              {(props) => (
                <InitialCustomizationPage firebase={props}/>
              )}
            </FirebaseContext.Consumer>
        }
        />
      </div>
    </Router>
  );
}

export default App;