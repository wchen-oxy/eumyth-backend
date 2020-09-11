import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './pursuit-holder';
import Timeline from "./sub-components/timeline";
import './index.scss';
import AxiosHelper from '../../Axios/axios';
import NoMatch from '../no-match';

//set each necessary state


class ProfilePage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.match.params.username,
            private: false,
            displayPhoto: "",
            coverPhoto: "",
            bio: "",
            pursuits: null,
            recentPosts: null,
            fail: false
        }
    }

    //fixme add catch for no found anything
    componentDidMount() {
        this._isMounted = true;
        // AxiosHelper.returnPursuitNames(this.state.username)
        //     .then(
        //         result => {
        //             console.log(result);
        //             if (!result.data) this.setState({ fail: true });
        //             else if (this._isMounted) {
        //                 this.setState({
        //                     pursuits: result.data
        //                 })
        //             }
        //         }
        //     );
        if (this._isMounted) AxiosHelper.returnUser(this.state.username)
            .then(
                response => {
                    if (!response) this.setState({ fail: true });              
                    else {
                        const result = response.data;
                        this.setState({
                            coverPhoto: result.cover_photo,
                            displayPhoto: result.cropped_display_photo,
                            bio: result.bio,
                            pinned: result.pinned,
                            pursuits: result.pursuits,   
                            allPosts: result.posts,
                            recentPosts: result.recent_posts,
                         
                        })
                    }
                }
            );
    }

    componentWillUnmount() {
        this._isMounted = false;

    }
    render() {
        var pursuitHolderArray = [];
        console.log(this.props.match.params);
        if (this.state.fail) return NoMatch;

        if (this.state.pursuits) {
            for (const pursuit of this.state.pursuits) {
                pursuitHolderArray.push(
                    <PursuitHolder pursuitData={pursuit} key={pursuit.name} value={pursuit.name} />
                );
            }
        }
        
        return (
            <div id="personal-profile-container">
                <div id="personal-profile-header">
                    {
                        this.state.user ?
                            (<img href={this.state.user.cover_photo}></img>) : (<div id="temp-cover"></div>)
                    }
                </div>
                <div id="personal-profile-intro-container">
                    <div id="personal-profile-photo">
                        {this.state.user ? <img href={this.state.user.display_photo}></img> : <></>}
                    </div>
                    <div id="personal-profile-name-container">
                        <h4 id="personal-profile-name">William Chen</h4>
                    </div>
                    <div id="personal-profile-description">
                    {this.state.bio ? <p>{this.state.bio}</p> : <p></p> }
                    </div>
                    <div id="pursuit-selection-container">
                    {pursuitHolderArray}
                   </div>

                </div>
                <Timeline recentPosts={this.state.recentPosts}/>
                    
                {/* <div className="pursuit-board-container">
                {pursuitHolderArray.map((pursuit) => pursuit)}
            </div> */}
            </div>
        );

    }
}

export default withFirebase(ProfilePage); 