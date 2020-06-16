import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './pursuit-holder';
import './index.scss';


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
   
    componentDidMount() {
        this._isMounted = true;
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
                            );
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
        var pursuitHolderArray = [];
        
        for (const pursuit of this.state.pursuits){
            console.log(pursuit.name);
            pursuitHolderArray.push(
            <PursuitHolder pursuitData={pursuit} key={pursuit.name} value={pursuit.name}/>
            );
        }
        console.log(pursuitHolderArray)
      
        return (
            <div className="pursuit-board-container">
            {pursuitHolderArray.map((pursuit) => pursuit)}
            </div>
        );
    }
}

export default withFirebase(PursuitProfile); 