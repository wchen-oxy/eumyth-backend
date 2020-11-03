import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Event from './sub-components/timeline-event';
import AxiosHelper from '../../../Axios/axios';
import './index.scss';

class Timeline extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            events: null,
            hasMore: true,
            feedData: [[]],
            fixedDataLoadLength: 4,
            nextOpenPostIndex: 0
        }

        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.createTimelineRow = this.createTimelineRow.bind(this);

    }

    componentDidMount() {
        this._isMounted = true;
        if (this.props.allPosts) {
            console.log("Mount now");
            console.log(this.props.allPosts);
            this.fetchNextPosts(this.props.allPosts);
        }
    }

    createTimelineRow(inputArray) {
        let masterArray = this.state.feedData;
        let index = masterArray.length - 1; //index position of array in masterArray
        let nextOpenPostIndex = this.state.nextOpenPostIndex;

        let j = 0;
        let k = masterArray[index].length; //length of last array 
        console.log(k);
        //while input array is not empty
        while (j < inputArray.length) {
            //while the last sub array is not empty
            while (k < 4) {
                if (!inputArray[j]) break; //if we finish...
                masterArray[index].push(
                    <Event
                        key={nextOpenPostIndex}
                        eventIndex={nextOpenPostIndex}
                        eventData={inputArray[j]}
                        onEventClick={this.props.onEventClick} />
                );

                nextOpenPostIndex++;
                k++;
                j++;
            }
            if (k === 4) masterArray.push([]);
            if (!inputArray[j]) break;
            index++;
            k = 0;
        }
        this.setState({ feedData: masterArray, nextOpenPostIndex: nextOpenPostIndex });
        console.log(masterArray);
        console.log(nextOpenPostIndex);

    }

    fetchNextPosts() {
        console.log("fetch");
        if (this.state.nextOpenPostIndex + this.state.fixedDataLoadLength >= this.props.allPosts.length) {
            console.log("Length of All Posts Exceeded");
            this.setState({ hasMore: false });
        }
        console.log( this.props.allPosts.slice(this.state.nextOpenPostIndex, this.state.nextOpenPostIndex + this.state.fixedDataLoadLength));
        return AxiosHelper.returnMultiplePosts(
            this.props.targetProfileId,
            this.props.allPosts.slice(this.state.nextOpenPostIndex, this.state.nextOpenPostIndex + this.state.fixedDataLoadLength))
            .then(
                (result) => {
                    console.log(result.data);
                    if (this._isMounted) this.createTimelineRow(result.data);
                }
            )
            .catch((error) => console.log(error));

    }

    render() {
        if (!this._isMounted) return (
            <div id="timeline-container">
                <p>Loading</p>
            </div>

        );
        console.log(this.state.feedData);
        console.log(this.state.nextOpenPostIndex);
        console.log(this.state.hasMore);
        return (
            <div id="timeline-container">
                <InfiniteScroll
                    dataLength={this.state.nextOpenPostIndex}
                    // fixedDataLoadLength={this.state.nextOpenPostIndex} //This is important field to render the next data
                    next={this.fetchNextPosts}
                    hasMore={this.state.hasMore}
                    loader={<h4>Loading...</h4>}
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                            <b>Yay! You have seen it all</b>
                        </p>
                    } >
                    {
                        this.state.feedData.map((item, index) => (
                            <div className="flex-display" key={index}>
                                {item}
                            </div>)

                        )}
                    {/* {timelineRows} */}
                </InfiniteScroll>
            </div>
        )
    }
}

export default Timeline;