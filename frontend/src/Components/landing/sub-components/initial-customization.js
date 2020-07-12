import React from 'react';
import './initial-customization.scss';
import CustomMultiSelect from "../../custom-clickables/createable-single";
import Firebase, { withFirebase } from '../../../Firebase';
import axios from 'axios';
import AxiosHelper from '../../../Axios/axios';
// import {CustomMultiSelect} from '../../custom-clickables/creatable-single';

const INITIAL_STATE = {
    firstName: '',
    lastName: '',
    username: '',
    pursuits: [],
    isTaken: false
   

}
class InitialCustomizationPage extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        
        this.state = {
            ...INITIAL_STATE
        }
    }

    handleChange(e) {
        e.preventDefault();
        console.log(e.target.value);
        this.setState({ [e.target.name]: e.target.value });

        if (e.target.name === "username") {
            console.log(AxiosHelper.testString());
            AxiosHelper.checkUsernameAvailable(e.target.value)
            .then(
                (response) =>
                {
                    console.log(response);
                    console.log(response.data);
                    response.data ? this.setState({isTaken: true}) : 
                    this.setState({isTaken: false});
                
                }
            );
           
            
        }
    }
    handleSelect(newValue, actionMeta) {
        console.group('Value Changed');
        console.log(newValue);
        this.setState({ pursuits: newValue })
        console.log(`action: ${actionMeta.action}`);
        console.groupEnd();
    }
    
    handleSubmit(e) {
        e.preventDefault();
        const pursuitsArray = [];
        for (const pursuit of this.state.pursuits){
            pursuitsArray.push(pursuit.value);
        }
       
        this.props.firebase.writeBasicUserData(
            this.state.username,
            this.state.firstName,
            this.state.lastName
           
        )
        .then(
            () => this.props.firebase.doUsernameUpdate(this.state.username)
            )
        .then(
            () => AxiosHelper.createUserProfile(this.state.username, pursuitsArray)
        )
        // .then( 
        //     (result) =>
        //     AxiosHelper.createIndexUserProfile(result.data, this.state.username, pursuitsArray)
        //     // axios.post('http://localhost:5000/user/index', { uid: result.data, username: this.state.username, private: false, pursuits: pursuitsArray})
        //     // this.props.firebase.writeInitialIndexUserData(result.data, this.state.username, false)
        // )
        .then(
            (success) => {if (success) window.location.reload()}
        );

        // axios.post('http://localhost:5000/pursuit', { uid: uid, pursuits: pursuitsArray })
        // .then(
        //   this.writeIndexUserData(uid, username, false)
        // )
       
        // .catch(err => 'Error: ' + err);

    }

    render() {
        console.log(this.state.username);
        const available = this.state.username !== '' && !this.state.isTaken ? "Available" : "Taken";
        const {username, firstName, lastName, pursuits} = this.state;
        let isInvalid = 
        username === '' ||
        firstName === '' ||
        lastName === '' ||
        pursuits === null ||
        pursuits.length === 0 ||
        this.state.isTaken === true;
        // const isTaken =
        console.log(this.state);
        console.log(isInvalid);

       
        //if exist return true
        return (
            <div className="basic-info-container">
                <form className="basic-info-form-container" onSubmit={this.handleSubmit}>
                    <h2>Let us know about you!</h2>
                    <label>
                        Don't worry this won't be public if you don't want it to.
                </label>
                    <input type="text" name="firstName" placeholder="First Name" onChange={this.handleChange} />
                    <input type="text" name="lastName" placeholder="Last Name" onChange={this.handleChange} />
                    <label>
                        Choose a username! {available}
                </label>
                    <input type="text" name="username" placeholder="Username" onChange={this.handleChange}/>
                    <label>
                        Tell us what you want to pursue or choose one from the list!
                </label>
                    <CustomMultiSelect name="pursuits" onSelect={this.handleSelect} />
                    <button disabled={isInvalid} type="submit" >
                        Submit
                    </button>
                </form>
            </div>
        );
    }
}
export default withFirebase(InitialCustomizationPage);