import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import LoginOrRegisterPage from './Components/welcome';
import './App.scss';

 
function App() {
  return (
    <Router>
      <div className="container">
      {/* FIXME MODIFY WELCOMEPAGE NAME TO SOMETHING MORE APPROPRIATE. */}
      <Route path="/" exact component={LoginOrRegisterPage} />
      {/* <Route path="/" exact component={RegisterPage} /> */}

      {/* <Route path="/edit/:id" component={EditExercise} />
      <Route path="/create" component={CreateExercise} />
      <Route path="/user" component={CreateUser} /> */}
      </div>
    </Router>
  );
}
 
export default App;