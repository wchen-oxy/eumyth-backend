import React from 'react';
import './initial-customization.scss';
import CustomMultiSelect from "../../custom-clickables/createable-single";
import Firebase, { withFirebase } from '../../../Firebase';
import axios from 'axios';
import AxiosHelper from '../../../Axios/axios';

const INITIAL_STATE = {
    firstName: '',
    lastName: '',
    username: '',
    pursuits: [],
    experienceSelects: [],
    isTaken: false

}
class InitialCustomizationPage extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePursuitExperienceChange = this.handlePursuitExperienceChange.bind(this);

        this.state = {
            ...INITIAL_STATE
        }
    }

    handleChange(e) {
        e.preventDefault();
        console.log(e.target.value);
        this.setState({ [e.target.name]: e.target.value });
        if (e.target.name === "username") {
            AxiosHelper.checkUsernameAvailable(e.target.value)
                .then(
                    (response) => {
                        console.log(response);
                        console.log(response.data);
                        response.data.status === 200 ? this.setState({ isTaken: true }) : this.setState({ isTaken: false });
                    }
                );


        }
    }
    handleSelect(newValue, actionMeta) {
        console.group('Value Changed');
        console.log(newValue);
        this.setState({ pursuits: newValue });
        console.log(`action: ${actionMeta.action}`);
        console.groupEnd();

        let pursuitArray = [];
        let experienceSelects = [];
        for (const pursuit of newValue){
            pursuitArray.push({name: pursuit.value, experience: ""});
            experienceSelects.push(
                <span>
                    <label>{pursuit.value}</label>
                    <select name={pursuit.value} id="experience" onChange={this.handlePursuitExperienceChange}>
                        <option value=""></option>
                        <option value="beginner">Beginner</option>
                        <option value="familiar">Familiar</option>
                        <option value="experienced">Experienced</option>
                        <option value="expert">Expert</option>
                    </select>
                </span>
            );
        }
        console.log(pursuitArray);
        this.setState({pursuits : pursuitArray, experienceSelects : experienceSelects});
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.firebase.writeBasicUserData(
            this.state.username,
            this.state.firstName,
            this.state.lastName
        )
            .then(
                () => this.props.firebase.doUsernameUpdate(this.state.username)
            )
            .then(
                () => AxiosHelper.createUserProfile(this.state.username, this.state.pursuits)
            )
            .then(
                (success) => {
                    console.log(success);
                    if (success) window.location.reload(); 
                }
            );
    }

    handlePursuitExperienceChange(e){
        const pursuit = e.target.name;
        const experience = e.target.value;
        console.log(pursuit);
        console.log(experience);
        let previousPursuitState = this.state.pursuits;
        console.log(previousPursuitState);
        for (const pursuit of previousPursuitState){
            if (pursuit.name === e.target.name) pursuit.experience = e.target.value;
        }
        this.setState({pursuits : previousPursuitState});
    }

    render() {
        console.log(this.state.username);
        const available = this.state.username !== '' && !this.state.isTaken ? "Available" : "Taken";
        const { username, firstName, lastName, pursuits } = this.state;
        let isInvalid =
            username === '' ||
            firstName === '' ||
            lastName === '' ||
            pursuits === null ||
            pursuits.length === 0 ||
            this.state.isTaken === true;

        const pursuitDetails = this.state.pursuits.length !== 0  ? this.state.experienceSelects : <></>;
     

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
                    <input type="text" name="username" placeholder="Username" onChange={this.handleChange} />
                    <label>
                        Tell us what you want to pursue or choose one from the list!
                </label>
                    <CustomMultiSelect name="pursuits" onSelect={this.handleSelect} />
                    {pursuitDetails}
                    <button disabled={isInvalid} type="submit" >
                        Submit
                    </button>
                </form>
            </div>
        );
    }
}
export default withFirebase(InitialCustomizationPage);