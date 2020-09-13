import React from 'react';
import './detailed-pursuit.scss';
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
            <div className="detailed-pursuit-container">
                <p>Test</p>

            </div>
        );
    }

}

export default DetailedPursuit;