import React from 'react';
import AuthUserContext from './context';
import { withFirebase } from '../../Firebase/context';
 
const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        authUser: null,
        isLoading: false,
      };
    }
 
    componentDidMount() {
      this.setState({isLoading : true});
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        authUser => {
          authUser
            ? this.setState({ authUser, isLoading: false })
            : this.setState({ authUser: null, isLoading: false });
        },
      );
    }
 
    componentWillUnmount() {
      this.listener();
    }
 
    render() {
      const {isLoading} = this.state;
      if (isLoading) {
        return <p>Loading ... </p>
      }

      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }
 
  return withFirebase(WithAuthentication);
};
 
export default withAuthentication;