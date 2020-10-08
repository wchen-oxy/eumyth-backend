import React from 'react';

const LongEvent = (props) => {
    const post = props.post;

    // if (!post.image_data) {
    //     const initialText = JSON.parse(post.text_data).blocks[0].text;
    //     return (
    //         <div>
    //             <p className="no-select">{post.text_data.blocks[0].length > 140 ? post.text_data.blocks[0].substring(0, 140) + "..." : post.text_data.blocks[0]}</p>
    //             {<h4>{post.title ? post.title : post.pursuit_category}</h4>}
    //         </div>
    //     )
    // }
    // const content = post.cover_photo_url ?
    //     <img src={post.cover_photo_url} /> :
    //     (<div>
    //         <img src={post.cover_photo_url} />
    //         <p className="no-select">{post.text_data.length > 140 ? post.text_data.substring(0, 140) + "..." : post.text_data}</p>
    //     </div>);
    // else {
    const initialText = JSON.parse(post.text_data).blocks[0].text;
    // getTextExcerpt();
    const cover = post.cover_photo_url ? <img className="event-cover-photo" src={post.cover_photo_url} /> :
        (<p className="no-select">{initialText.length > 140 ? initialText.substring(0, 140).trim() + "..." : initialText}</p>)
    return (
        <div>
            <div className="event-cover-container">
            {cover}
            </div>
            {<h4>{post.title ? post.title : post.pursuit_category}</h4>}
        </div>
    );
    // }
}

export default LongEvent;