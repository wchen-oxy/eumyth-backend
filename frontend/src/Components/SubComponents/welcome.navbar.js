import React from 'react';
import { Link } from 'react-router-dom';
import './welcome.navbar.scss';


// 
export default class Navbar extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: ''
          }
    }

    render(){
        return(
            <div className="welcome-navbar">
                <div className="row">
                <div className="col">
                    <a>interestHub</a>
                    </div>
                  
                </div>
            </div>
        )
    }
}
