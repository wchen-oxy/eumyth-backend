import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';
import HomePage from './Components/home/index';
import {withAuthentication} from './Components/session';



const App = () => (

  // componentDidMount() {
  //   this.props.firebase.auth.onAuthStateChanged((user) => {
  //     if (user) {
  //       console.log(user.email);
  //       console.log(user.emailVerified);
  //       if (!user.emailVerified) {
  //         this.setState({
  //           loggedIn: true,
  //           verified: false
  //         });
  //       }
  //       else {
  //         this.setState({
  //           loggedIn: true,
  //           verified: true
  //         });
  //       }
  //     }
  //     else{
  //       this.setState({loggedIn: false});
  //     }
  //   });

  // }


      <Router>
        <div className="container">
          <Route exact path ="/" component={HomePage}/>
        </div>
      </Router>
   
  
)

export default withAuthentication(App);
