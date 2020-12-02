import React from 'react';
import { withRouter } from 'react-router-dom';


class PursuitHolder extends React.Component {
    constructor(props) {
        super(props)
        // this.handleBoardChange = this.handleBoardChange.bind(this);
        this.state = {
            name: this.props.pursuitData.name,
            events: this.props.pursuitData.num_posts
        }
    }

    // handleBoardChange(e, name) {
    //     e.preventDefault();
    //     const currentPath = this.props.history.location.pathname;
    //     this.props.history.push( currentPath + '/pursuit/' + name);
    // };
   
    render() {

        const name = this.state.name;
        return (
            <div className="pursuit-container no-select" key={name}   onClick={() => this.props.onFeedSwitch(this.props.value)}>
                <h4>
                    {this.state.name}
                </h4>
                <p>
                    Events: {this.state.events}
                </p>
            </div>
        );
    }

}

export default withRouter(PursuitHolder);