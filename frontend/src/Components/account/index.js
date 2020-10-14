import React from 'react';
import PasswordChangeForm from '../password/change';
import { AuthUserContext, withAuthorization } from '../session';
 
const AccountPage = () => (
<AuthUserContext.Consumer>
    {authUser => (
      <div>
        <h1>Account: {authUser.email}</h1>
        <PasswordChangeForm />
      </div>
    )}
  </AuthUserContext.Consumer>
);
 
const condition = authUser => !!authUser;
 
export default withAuthorization(condition)(AccountPage);