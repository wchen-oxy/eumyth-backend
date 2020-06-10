import React from 'react';
import { withFirebase } from '../../../Firebase';
import axios from 'axios';

class PursuitHolder extends React.Component  {

    constructor(props){
        super(props);
        this.state = {
            pursuits: null
        }
    }

    componentDidMount(){
        const uid = this.props.firebase.auth.currentUser.uid;
        console.log(uid);
        axios.post('http://localhost:5000/pursuit/title', {uid:uid})
        .then(
            (response) => {
                console.log(response);
                this.setState({pursuits:response});
            }
        )
        .catch(
            err => console.log('Error: ' + err)
        )
    }

    render(){
        // console.log(this.state.pursuits);
        const pursuitArray = this.state.pursuits;
        const items = [];
        if (!!pursuitArray){
            // console.log(pursuitArray.data);
            for (var i = 0; i < pursuitArray.data.length; i++){
                const name = pursuitArray.data[i].name;
                console.log(name)
                items.push(
                            <div className="pursuit-board" key={name}>
                                <p>
                                    {name}
                                </p>
                            </div>
                        );
                        
            }
        
    }
        
    return(
        <div className="pursuit-boards-container">
            {items}
        </div>
    )
    }

}


//

export default withFirebase(PursuitHolder)