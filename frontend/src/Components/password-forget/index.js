import React from 'react';
import {withFirebase} from '../../Firebase';
import {Link} from 'react-router-dom';

const PasswordForgetPage = () => (
    <div>
        <h4>Reset Your Password</h4>
        <PasswordForgetForm/>
    </div>
)

const INITIAL_STATE = {
    email: '',
    error: null,
}

class PasswordForgetFormBase extends React.Component {
    constructor(props){
        super(props);
        this.state = { ...INITIAL_STATE};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);

    }

    handleSubmit(e){
      e.preventDefault();
        const {email} = this.state;
        this.props.firebase
      .doPasswordReset(email)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => {
        this.setState({ error });
      });
 
       
    }

    handleChange(e){
        this.setState({[e.target.name]: e.target.value})
    }

    render(){
        const { email, error } = this.state;
        const isInvalid = email === '';

        return(
            <form onSubmit={this.handleSubmit}>
            <input
              name="email"
              value={this.state.email}
              onChange={this.handleChange}
              type="text"
              placeholder="Email Address"
            />
            <button disabled={isInvalid} type="submit">
              Reset My Password
            </button>
     
            {error && <p>{error.message}</p>}
          </form>
        );
    }
}

const PasswordForgetLink = () => (
    <p>
      <Link to='/'>Forgot Password?</Link>
    </p>
  );


  export default PasswordForgetPage;
 
  const PasswordForgetForm = withFirebase(PasswordForgetFormBase);
   
  export { PasswordForgetForm, PasswordForgetLink };