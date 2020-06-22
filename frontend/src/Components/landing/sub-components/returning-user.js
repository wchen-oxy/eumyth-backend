import React from 'react';
import { withAuthorization } from '../../session';
import { withFirebase } from '../../../Firebase';
import PursuitProfile from '../../pursuit';
import { Link, Router } from 'react-router-dom';
import AxiosHelper from '../../../Axios/axios';



class ReturningUserPage extends React.Component{
    _isMounted = false;
    constructor(props){
        super(props);
        this.state = {
            username: ''
        }

        this.handlePursuitClick = this.handlePursuitClick.bind(this);
    }

    componentDidMount(){
        this._isMounted = true;
        console.log(this.props.firebase.auth.currentUser.uid);
        AxiosHelper.returnIndexUsername(this.props.firebase.auth.currentUser.uid)
        .then(result => 
            {
            if (this._isMounted) this.setState({username: result.data})
        }
            );
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    handlePursuitClick(e, url){
        e.preventDefault();
        this.props.history.push(this.state.username);

    }

    render(){
        
       
            return(
                <div>               
                <p>
                    Temp Homes
                </p>
                <h1>
                    Check Pursuits
                </h1>
                <button onClick={this.handlePursuitClick}>Pursuits</button>
                     </div>
                )           
        }
}

const handleCheckUser = () => {
    this.props.firebase.checkExistingUser()}

const condition = authUser => !!authUser && withFirebase(handleCheckUser);
export default withAuthorization(condition)(withFirebase(ReturningUserPage));
