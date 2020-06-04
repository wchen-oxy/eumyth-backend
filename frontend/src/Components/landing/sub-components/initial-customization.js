import React from 'react';
import './initial-customization.scss';
import CustomMultiSelect from "../../custom-clickables/createable-single";
// import {CustomMultiSelect} from '../../custom-clickables/creatable-single';


const InitialCustomizationPage = (props) => (

    <div className="basic-info-container">

        <form className="basic-info-form-container">
            <h2>Let us know about you!</h2>
            <label>
                Don't worry this won't be public if you don't want it to.
             </label>
            <input type="text" name="first-name" placeholder="First Name" />
            <input type="text" name="last-name" placeholder="Last Name" />
            <label>
                Choose a username!
             </label>
            <input type="text" name="username" placeholder="Username" />
            <label>
                Tell us what you want to pursue or choose one from the list!
            </label>
            <CustomMultiSelect/>
           
        </form>
    </div>
);

export default InitialCustomizationPage;