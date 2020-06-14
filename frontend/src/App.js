import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';
import HomePage from './Components/home/index';
import AccountPage from  './Components/account';
import {withAuthentication} from './Components/session';
import Navbar from './Components/navbar/index';
import PursuitProfile from './Components/pursuit';


const App = () => (
      <Router>
         <Navbar />
          <Route exact path ='/' component={HomePage}/>
         
          <Route exact path ='/account' component={AccountPage} />
          {/* <Route exact path = '/pursuit' component={PursuitPage}/> */}
          <Route exact path = '/:username' component={PursuitProfile} />
      </Router>
   
)

export default withAuthentication(App);
