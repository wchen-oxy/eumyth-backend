import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './Components/home/index';
import AccountPage from './Components/account';
import { withAuthentication } from './Components/session';
import Navbar from './Components/navbar/index';
import ProfilePage from './Components/profile';
import './App.scss';

const App = () => (
      <Router>
            <Navbar />
            <Switch>
                  <Route exact path='/' component={HomePage} />
                  <Route exact path='/account' component={AccountPage} />
                  {/* <Route exact path ='/new' component={NewPost} /> */}
                  {/* <Route exact path = '/pursuit' component={PursuitPage}/> */}
                  <Route exact path='/:username' component={ProfilePage} />
                  <Route exact path='/p/:postId' component={ProfilePage} />
                  {/* <Route exact path = '/:username/pursuit/:pursuit' component={DetailedPursuit} /> */}
            </Switch>
      </Router>

)

export default withAuthentication(App);
