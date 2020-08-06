import React from 'react';
import { withAuthorization } from '../../session';
import { withFirebase } from '../../../Firebase';
import PursuitProfile from '../../pursuit';
import { Link, Router } from 'react-router-dom';
import AxiosHelper from '../../../Axios/axios';
import './returning-user.scss';



class ReturningUserPage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            username: ''
        }
        this.handlePursuitClick = this.handlePursuitClick.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        // console.log(this.props.firebase.auth.currentUser.uid);
        // AxiosHelper.returnIndexUsername(this.props.firebase.auth.currentUser.uid)
        // .then(result => 
        //     {
        //     if (this._isMounted) this.setState({username: result.data})
        // }
        //     );
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handlePursuitClick(e, url) {
        e.preventDefault();
        this.props.history.push(this.state.username);

    }

    render() {


        return (
            <div id="home-page-container">
                <div className="home-row-container" id="home-profile-row">
                    <div className="home-profile-column-container">
                        <div id="home-photo-container">
                            <img id="home-profile-photo" src="https://i.redd.it/73j1cgr028u21.jpg"></img>
                        </div>

                    </div>
                    <div className="home-profile-column-container">
                        <div>
                            Username
                    </div>
                        <div>
                            Total Hours Spent
                    </div>
                    </div>
                    <div className="home-profile-column-container">
                        Data for your pursuits
                    </div>

                </div>
                <div className="home-row-container home-works-column-container">
                    <div className="home-works-column-container">
                        <div className="home-works-row-container">
                            <h4>Recent Work</h4>
                            <button onClick={this.handlePursuitClick}>Pursuits</button>
                        </div>
                    </div>
                    <div className="home-works-column-container">

                        <div className="home-works-row-container">
                            <div id="placeholder-dummy">

                            </div>
                        </div>
                    </div>

                </div>
                <div className="home-row-container home-works-column-container">
                <div className="home-works-column-container">
                        <div className="home-works-row-container">
                            <h4>Your Feed</h4>
                        </div>
                    </div>
                    <div className="home-works-column-container">
                        <div id="placeholder-feed">

                        </div>
                    </div>

                </div>
            </div>
        )
    }
}

const handleCheckUser = () => {
    this.props.firebase.checkExistingUser()
}

const condition = authUser => !!authUser && withFirebase(handleCheckUser);
export default withAuthorization(condition)(withFirebase(ReturningUserPage));
