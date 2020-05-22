import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import WelcomePage from './Components/welcome/welcome';
import './App.scss';
import { FirebaseContext } from './Firebase';


function App() {
  console.log("APP");
  return (
    <Router>
      <div className="container">
        <Route render={
          () =>
            <FirebaseContext.Consumer>
              {(props) => (
                <WelcomePage firebase={props} />
              )}
            </FirebaseContext.Consumer>
        }
        />
      </div>
    </Router>
  );
}

export default App;