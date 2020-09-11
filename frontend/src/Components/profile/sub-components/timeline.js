import React from 'react';
import './timeline.scss';

class Timeline extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
           recentPosts: this.props.recentPosts
        }
    }

    componentDidMount(){
        let array = [];
        for (let i = 0; i < this.state.recentPosts.length; i++){
            const post = this.state.recentPosts[i];
            array.push(
                <div className="event-container" key={i}>
                    {post.cover_photo_url ? <img src={post.cover_photo_url}/> : <div>Blahblah</div>}
                    <h4>{post.preview_title}</h4>
                </div>
            )
          
            //attach onclick 
        }
    }

    render() {
        return (
            <div id="timeline-container">

            </div>
        );
    }

}

export default Timeline;