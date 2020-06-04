import React from 'react';
import {withAuthorization} from '../session';
import InitialCustomizationPage from './sub-components/initial-customization'
import './index.scss';
class UserHomePage extends React.Component {

    constructor(props) {
        super(props)
        // this.handleSignOut = this.handleSignOut.bind(this);
        this.handleBasicInfoChange = this.handleBasicInfoChange.bind(this);
    }
    componentDidMount(){
        // this.props.firebase
    }
    handleBasicInfoChange(e){

    }
    // handleSignOut(e) {
    //     e.preventDefault();
    //     this.props.firebase.doSignOut();
    // }

    render() {
        console.log("Test");
        console.log(this.props.firebase.auth.currentUser);
        return (
           <InitialCustomizationPage/>
        )
    }
}

// long vesion is 
// const condition = authUser => authUser != null;
const condition = authUser => !!authUser;
export default withAuthorization(condition)(UserHomePage);
