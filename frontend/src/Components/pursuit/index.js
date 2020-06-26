import React from 'react';
import { useParams } from 'react-router-dom';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './pursuit-holder';
import './index.scss';
import AxiosHelper from '../../Axios/axios';
import NoMatch from '../no-match';


class PursuitProfile extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            username: this.props.match.params.username,
            private: false,
            pursuits: [],
            fail: false
        }
    }
    //fixme add catch for no found anything
    componentDidMount() {
        this._isMounted = true;
        AxiosHelper.returnPursuitNames(this.state.username)
            .then(
                result => {
                    console.log(result);
                if (!result.data) this.setState({ fail: true});
                else if (this._isMounted) {
                    this.setState({
                        pursuits: result.data.pursuits
                    })
                }
            }

            );
        
    }

    componentWillUnmount() {
        this._isMounted = false;

    }
    render() {
        console.log("Pursuit");
        var pursuitHolderArray = [];
        console.log(this.props.match.params);
        if (this.state.fail) return NoMatch;

        for (const pursuit of this.state.pursuits) {
            pursuitHolderArray.push(
                <PursuitHolder pursuitData={pursuit} key={pursuit.name} value={pursuit.name} />
            );
        }
        if (pursuitHolderArray.length !== 5) pursuitHolderArray.push(
            <div id="new-pursuit-container">
                New Temp Pursuit Button
            </div>
        );
        return (
            <div id="profile-container">
                <div id="profile-header">
                    <div id="temp-cover">        
                    </div>
                    <div id="profile-photo">
                    </div>
                </div>
                <div id="profile-intro-container">
                <div id="profile-name-container">
                    <h4 id="profile-name">William Chen</h4>
                </div>
                <div id="profile-description">
                    <p>Description</p>
                </div>
                
                </div>  
                <div id="pursuit-selection-container">
                    {pursuitHolderArray}
                </div>
                <div id="event-container">
                </div> 
            {/* <div className="pursuit-board-container">
                {pursuitHolderArray.map((pursuit) => pursuit)}
            </div> */}
            </div>
        );

    }
}

export default withFirebase(PursuitProfile); 