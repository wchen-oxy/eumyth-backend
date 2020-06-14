import React from 'react';
import { withFirebase } from '../../../Firebase';
import axios from 'axios';
import './pursuit-holder.scss';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';

class PursuitHolderBase extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pursuits: null
        }
        this.handleBoardChange = this.handleBoardChange.bind(this);
    }

    handleBoardChange(e){
        e.preventDefault();
        console.log("Triggered");
       this.props.history.push('/pursuit');
    }

    componentDidMount() {
        const uid = this.props.firebase.auth.currentUser.uid;
        console.log(uid);
        axios.post('http://localhost:5000/pursuit/title', { uid: uid })
            .then(
                (response) => {
                    console.log(response);
                    this.setState({ pursuits: response });
                }
            )
            .catch(
                err => console.log('Error: ' + err)
            )
    }

    render() {
        // console.log(this.state.pursuits);
        const pursuitArray = this.state.pursuits;
        const items = [];
        if (!!pursuitArray) {
            // console.log(pursuitArray.data);
            for (var i = 0; i < pursuitArray.data.length; i++) {
                const name = pursuitArray.data[i].name;
                console.log(name)
                items.push(
                    <div className="pursuit-board" key={name} value={name} onClick={this.handleBoardChange}>
                        <p>
                            {name}
                        </p>
                    </div>
                );
            }
        }
        return (
            <div className="pursuit-board-container">
                {items}
            </div>
        )
    }
}

const PursuitHolder = compose(
    withRouter,
    withFirebase,
)(PursuitHolderBase);
export default PursuitHolder;