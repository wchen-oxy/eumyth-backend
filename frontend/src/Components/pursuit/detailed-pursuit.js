import React from 'react';
import axios from 'axios';

class DetailedPursuit extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {

        }
    }

    componentDidMount(){
        
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    render(){
        return(
            "Detailed"
        );
    }

}

export default DetailedPursuit;