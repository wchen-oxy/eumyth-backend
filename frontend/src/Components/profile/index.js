import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './sub-components/pursuit-holder';
import Timeline from "./timeline";
import './index.scss';
import AxiosHelper from '../../Axios/axios';
import NoMatch from '../no-match';
import EventModal from "./sub-components/event-modal";

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
            allPosts: null,
            fail: false,
            selectedEvent: null,
        }
        this.modalRef = React.createRef();
        this.handleEventClick = this.handleEventClick.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
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
        AxiosHelper.returnUser(this.state.username)
            .then(
                response => {
                    if (!response) this.setState({ fail: true });
                    else {
                        const result = response.data;
                        console.log(result.cropped_display_photo);
                        if (this._isMounted) this.setState({
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


    openModal() {
        this.modalRef.current.style.display = "block";
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        this.modalRef.current.style.display = "none";
        document.body.style.overflow = "visible";
    }

    handleEventClick(index) {
        console.log(index);
        const selectedEvent = index < this.state.recentPosts.length ? this.state.recentPosts[index] : this.state.allPosts[index];
        this.setState({selectedEvent : selectedEvent}, this.openModal());
    }

    render() {
        var pursuitHolderArray = [];
        if (this.state.fail) return NoMatch;
        if (this.state.pursuits) {
            for (const pursuit of this.state.pursuits) {
                pursuitHolderArray.push(
                    <PursuitHolder pursuitData={pursuit} key={pursuit.name} value={pursuit.name} />
                );
            }
        }
        console.log(this.state.displayPhoto);

        return (
            <div>
                <div id="personal-profile-container">
                <div id="personal-profile-header">
                    {
                        this.state.coverPhoto ?
                            (<img src={this.state.coverPhoto}></img>) : (<div id="temp-cover"></div>)
                    }
                </div>
                <div id="personal-profile-intro-container">
                    <div id="personal-profile-photo">
                        {this.state.displayPhoto ? <img src={this.state.displayPhoto}></img> : <></>}
                        <div id="personal-profile-name-container">
                        <h4 id="personal-profile-name">William Chen</h4>
                        </div>
                    </div>
                   
                    <div id="personal-profile-description">
                        {this.state.bio ? <p>{this.state.bio}</p> : <p></p>}
                    </div>
                    <div id="pursuit-selection-container">
                        {pursuitHolderArray}
                    </div>

                </div>
                </div>
                <div id="personal-profile-timeline-container">
                <Timeline recentPosts={this.state.recentPosts} onEventClick={this.handleEventClick} />

                </div>

                {/* <div className="pursuit-board-container">
                {pursuitHolderArray.map((pursuit) => pursuit)}
            </div> */}
                <div className="modal" ref={this.modalRef}>
                    <div className="overlay"></div>
                    <span className="close" onClick={(() => this.closeModal())}>X</span>
                    <EventModal closeModal={this.closeModal} eventData={this.state.selectedEvent}/>
                </div>
            </div>
        );

    }
}

export default withFirebase(ProfilePage); 