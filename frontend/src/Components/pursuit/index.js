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
            private: false,
            pursuits: []
        }


    }
    // componentDidUpdate(){
    //     axios.post('http://localhost:5000/pursuit', {uid: this.state.uid}).then(
    //         (res) => console.log(res)
    //         //create mongo side profile
    //     )
    //     .catch(
    //         err => console.log(err)
    //     );
    // }

    componentDidMount() {
        this._isMounted = true;
        // axios.get('http://localhost:5000/', )
        //should return uid
        console.log(this.state.username);
        if (this._isMounted) axios.get('http://localhost:5000/pursuit', {
                            params:{
                            username: this.state.username
                            }
                        })
                        .then(
                            result => this.setState({
                                pursuits: result.data
                            })
                            )
                        ;
        // if (this._isMounted) axios.get('http://localhost:5000/user/index', {
        //     params: {
        //         username: this.state.username
        //     }
        // })
        //     .then(
        //         result =>
        //         {
        //             console.log(result.data.uid);
        //             return axios.get('http://localhost:5000/pursuit', {
        //                 uid: result.data.uid
        //             });
        //         }
                  
        //     )
        //     .then(
        //         result => console.log(result)
        //     );
    }

    componentWillUnmount() {
        this._isMounted = false;

    }
    render() {
        const username = this.state.username;
        var pursuits = [];
        // console.log(username);
        console.log(this.state.pursuits);

        return (
            "Pur"
        );
    }
}

export default withFirebase(PursuitProfile); 