import React from 'react';
import { withAuthorization } from '../../session';
import { withFirebase } from '../../../Firebase';
import AxiosHelper from '../../../Axios/axios';
import './returning-user.scss';
import RecentWorkObject from "./recent-work-object";
import FeedObject from "./feed-object";
class ReturningUserPage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            username: ''
        }
        this.handlePursuitClick = this.handlePursuitClick.bind(this);
        this.handleRecentWorkClick = this.handleRecentWorkClick.bind(this);

    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handlePursuitClick(e) {
        e.preventDefault();
        this.props.history.push(this.state.username);

    }

    handleRecentWorkClick(e, value) {
        e.preventDefault();
        alert(value);
    }

    render() {
        //FIXME replace recentwork with actual values
        const recentWork = (<RecentWorkObject value="test" onRecentWorkClick={this.handleRecentWorkClick} />);
        return (
            <div id="home-page-container">
                <div className="home-row-container" id="home-profile-row">
                    <div className="home-profile-column-container">

                        <img className="home-profile-photo" src="https://i.redd.it/73j1cgr028u21.jpg"></img>

                        <div className="home-profile-text">
                            <p>Username</p>
                        </div>

                    </div>

                    <div className="home-profile-column-container">
                        <div className="home-profile-text">
                            Total Hours Spent
                        </div>
                        <div className="home-profile-text">
                            50!
                        </div>
                    </div>
                    <div className="home-profile-column-container">
                        <table id="profile-info-table">
                            <tr>
                                <th></th>
                                <th>Level</th>
                                <th>Hours Spent</th>
                                <th>Posts</th>
                                <th>Milestones</th>
                            </tr>
                            <tr>
                                <th>Hobby1</th>
                                <td>20</td>
                                <td>50</td>
                                <td>10</td>
                            </tr>
                            <tr>
                                <th>Hobby2</th>
                                <td>20</td>
                                <td>50</td>
                                <td>10</td>
                            </tr>
                            <tr>
                                <th>Hobby3</th>
                                <td>20</td>
                                <td>50</td>
                                <td>10</td>
                            </tr>
                        </table>
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
                            {recentWork}
                            {recentWork}
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
                            <FeedObject />
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}

const handleCheckUser = () => {
    this.props.firebase.checkIsExistingUser()
}

const condition = authUser => !!authUser && withFirebase(handleCheckUser);
export default withAuthorization(condition)(withFirebase(ReturningUserPage));
