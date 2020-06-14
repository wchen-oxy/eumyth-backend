import React from 'react';
import { withAuthorization } from '../../session';
import { withFirebase } from '../../../Firebase';
import PursuitProfile from '../../pursuit';


class ReturningUserPage extends React.Component{
    constructor(props){
        super(props);
    }

    render(      
        ){


            return(
                    "Temp Home"
                )
                
        }
    
}

const handleCheckUser = () => {
    this.props.firebase.checkExistingUser()}

const condition = authUser => !!authUser && withFirebase(handleCheckUser);
export default withAuthorization(condition)(withFirebase(ReturningUserPage));
