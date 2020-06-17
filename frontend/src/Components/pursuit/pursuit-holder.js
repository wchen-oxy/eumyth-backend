import React from 'react';
import axios from 'axios';
import './pursuit-holder.scss';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';


class PursuitHolder extends React.Component {
    constructor(props) {
        super(props)
        this.handleBoardChange = this.handleBoardChange.bind(this);
        this.state = {
            pursuitName: this.props.pursuitData.name
        }
    }

    handleBoardChange(e, pursuitName) {
        e.preventDefault();
        const currentPath = this.props.history.location.pathname;
        this.props.history.push( currentPath + '/pursuit/' + pursuitName);
    };
   
    render() {

        const pursuitName = this.state.pursuitName;
        return (
            <div className="pursuit-container" key={pursuitName} value={pursuitName} onClick={(e) => this.handleBoardChange(e, pursuitName)}>
                <h2>
                    {this.props.pursuitData.name}
                </h2>
                <p>
                    Events: {this.props.pursuitData.numEvent}
                </p>
            </div>
        );
    }

}

export default withRouter(PursuitHolder);