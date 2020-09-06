import React from 'react';
import './pursuit-holder.scss';
import { withRouter } from 'react-router-dom';


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
                <h4>
                    {this.props.pursuitData.name}
                </h4>
                <p>
                    Events: {this.props.pursuitData.numEvent}
                </p>
            </div>
        );
    }

}

export default withRouter(PursuitHolder);