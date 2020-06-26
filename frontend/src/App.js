import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';
import HomePage from './Components/home/index';
import AccountPage from  './Components/account';
import {withAuthentication} from './Components/session';
import Navbar from './Components/navbar/index';
import PursuitProfile from './Components/pursuit';
import DetailedPursuit from './Components/pursuit/detailed-pursuit';
import NewEntry from './Components/entry/index';


const App = () => (
      <Router>
         <Navbar />
         <Switch>
          <Route exact path ='/' component={HomePage}/>
          <Route exact path ='/account' component={AccountPage} />
          <Route exact path ='/new' component={NewEntry} />
          {/* <Route exact path = '/pursuit' component={PursuitPage}/> */}
          <Route exact path = '/:username' component={PursuitProfile} />
          <Route exact path = '/:username/pursuit/:pursuit' component={DetailedPursuit} />
          </Switch>
      </Router>
   
)

export default withAuthentication(App);
