import React from 'react';
import axios from 'axios';
import './pursuit-holder.scss';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';



function handleBoardChange(e, pursuitName) {
  
    e.preventDefault();   
    //FIXME 
   this.props.history.push('/pursuit' + pursuitName);
};

const PursuitHolder = (props) =>  {
    
    

    // componentDidMount() {
    //     const uid = this.props.firebase.auth.currentUser.uid;
    //     console.log(uid);
    //     axios.post('http://localhost:5000/pursuit/title', { uid: uid })
    //         .then(
    //             (response) => {
    //                 console.log(response);
    //                 this.setState({ pursuits: response });
    //             }
    //         )
    //         .catch(
    //             err => console.log('Error: ' + err)
    //         )
    // }

   
        // console.log(this.state.pursuits);
        // const pursuitArray = this.state.pursuits;
        // const items = [];
        // if (!!pursuitArray) {
        //     // console.log(pursuitArray.data);
        //     for (var i = 0; i < pursuitArray.data.length; i++) {
        //         const name = pursuitArray.data[i].name;
        //         console.log(name)
        //         items.push(
        //             <div className="pursuit-board" key={name} value={name} onClick={this.handleBoardChange}>
        //                 <p>
        //                     {name}
        //                 </p>
        //             </div>
        //         );
        //     }
        // }
        console.log(props.pursuitData);
        const pursuitName = props.pursuitData.name;
        return (
            <div className="pursuit-container" key={pursuitName} value={pursuitName} onClick={(e) => handleBoardChange(e, pursuitName)}>
                <h2>
                    {props.pursuitData.name}
                </h2>
                <p>
                    Events: {props.pursuitData.events.length}
                </p>
            </div>
        );
    
}

export default withRouter(PursuitHolder);