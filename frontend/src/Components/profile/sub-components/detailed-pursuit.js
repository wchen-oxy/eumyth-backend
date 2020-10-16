import React from 'react';
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
            <div className="detailed-pursuit-container flex-display">
                <p>Test</p>
            </div>
        );
    }

}

export default DetailedPursuit;