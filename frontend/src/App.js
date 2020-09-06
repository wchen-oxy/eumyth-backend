import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';
import HomePage from './Components/home-redirect/index';
import AccountPage from  './Components/account';
import {withAuthentication} from './Components/session';
import Navbar from './Components/navbar/index';
import ProfilePage from './Components/profile';
import DetailedPursuit from './Components/profile/detailed-pursuit';
import NewPost from './Components/post/index';


const App = () => (
      <Router>
         <Navbar />
         <Switch>
          <Route exact path ='/' component={HomePage}/>
          <Route exact path ='/account' component={AccountPage} />
          <Route exact path ='/new' component={NewPost} />
          {/* <Route exact path = '/pursuit' component={PursuitPage}/> */}
          <Route exact path = '/:username' component={ProfilePage} />
          <Route exact path = '/:username/pursuit/:pursuit' component={DetailedPursuit} />
          </Switch>
      </Router>
   
)

export default withAuthentication(App);
