import React from 'react';
import Event from './sub-components/event';
import './timeline.scss';

class Timeline extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            events: null
        }
    }

    render() {
        let array = [];
        if (this.props.recentPosts) for (let i = 0; i < this.props.recentPosts.length; i++) {
                const event = this.props.recentPosts[i];
                array.push(
                    <Event key={i} eventIndex={i} eventData={event} onEventClick={this.props.onEventClick} />
                )
            }
         console.log(this.props.recentPosts);
          
        return (
            <>
                <div id="timeline-container">
                    {array}
                </div>
             
            </>
        );
    }
}

export default Timeline;