import React from 'react';


const ShortEvent = (props) => {
    console.log(props.post);
    const post = props.post;
    //No Cover Photo
    if (post.image_data.length === 0) {
        // let intitialText = null;
        // if (typeof (post.text_data) === 'string') intitialText = (post.text_data.length > 140 ? post.text_data.substring(0, 140).trim() + "..." : post.text_data);
        // else {
        //     intitialText = post.text_data[0].length > 140 ? post.text_data[0].substring(0, 140).trim() + "..." : post.text_data[0]
        // }

        const intitialText = post.text_snippet;
        const activityType = post.is_milestone ? "MileStone" : "Progress";


            return (
                <div>
                    <div className="event-cover-container no-cover-photo">
                        <p className="no-select">
                            {intitialText}
                        </p>
                    </div>
                    {post.title? <h4>{post.title}</h4> : <></>}
                    {post.pursuit_category ? <h4>{post.pursuit_category} {activityType} </h4> : <></>}
                </div>
            );
        
    }
    //YES COVER PHOTO
    else {
       
        if (!post.title) {
            const activityType = post.is_milestone ? "MileStone" : "Progress";
            return (
                <div>
                    <div className="event-cover-container">
                        <img className="event-cover-photo" src={post.image_data[0]} />
                    </div>
                    {post.pursuit_category ? <h4>{post.pursuit_category} {activityType} </h4> : <></>}
                </div>
            );
        }
        else {
            return (
                <div>
                    <div className="event-cover-container">
                        <img className="event-cover-photo" src={post.image_data[0]} />
                    </div>
                    {post.title ? <h4>{post.title}</h4> : <></>}
                </div>
            );
        }
    }
}

export default ShortEvent;