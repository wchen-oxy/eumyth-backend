import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { withFirebase } from '../../Firebase';


class PursuitProfile extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            username: this.props.match.params.username,
            uid: null,
            private: false
        }


    }
    componentDidUpdate(){
        axios.post('http://localhost:5000/pursuit', {uid: this.state.uid}).then(
            (res) => console.log(res)
            //create mongo side profile
        )
        .catch(
            err => console.log(err)
        );
    }

    componentDidMount() {
        this._isMounted = true;
        // axios.get('http://localhost:5000/', )
        //should return uid
        if (this._isMounted) this.props.firebase.getProfileInfo(this.state.username)
            .then(
                result => {
                   
                        this.setState({
                            uid: result.uid,
                            private: result.private
                        })
                    
                }
            );

    }

    componentWillUnmount() {
        this._isMounted = false;

    }
    render() {
        const uid = this.state.uid;
        var pursuits = [];
        console.log(uid);
      
        return (
            "Pur"
        );
    }
}

export default withFirebase(PursuitProfile); 