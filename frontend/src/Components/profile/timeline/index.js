import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Event from './sub-components/timeline-event';
import './index.scss';
import AxiosHelper from '../../../Axios/axios';

class Timeline extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            events: null,
            hasMore: true,
            feedData: [[]],
            fixedDataLoadLength: 24,
            lastRetrievedPostIndex: -1
        }

        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.createTimelineRow = this.createTimelineRow.bind(this);

    }

    componentDidMount() {
        console.log(this.props.recentPosts);
        if (this.props.recentPosts) {
            this.createTimelineRow(this.props.recentPosts);
            // this.props.createTimelineRow(this.props.recentPosts);
        }
    }

    // componentDidUpdate(){
    //     if (this.props.recentPosts) {
    //         console.log("FUCK YOU MORE");

    //         this.createTimelineRow(this.props.recentPosts);
    //         // this.props.createTimelineRow(this.props.recentPosts);
    //     }

    // }

    createTimelineRow(inputArray) {
        let masterArray = this.state.feedData;
        let index = masterArray.length - 1;
        let lastRetrievedPostIndex = this.state.lastRetrievedPostIndex;

        let j = 0;
        let k = masterArray[index].length //length of last array 
        //while input array is not empty
        while (j < inputArray.length) {
            //while the last sub array is not empty
            while (k < 4) {
                if (!inputArray[j]) break;
                console.log(inputArray[j])
                masterArray[index].push(
                    <Event
                        key={lastRetrievedPostIndex}
                        eventIndex={lastRetrievedPostIndex}
                        eventData={inputArray[j]}
                        onEventClick={this.props.onEventClick} />
                );
                lastRetrievedPostIndex++;
                k++;
                j++;
            }
            if (!inputArray[j]) break;
            masterArray.push([]);
            index++;
            k = 0;
            // tempArray = [];
        }
        // console.log(masterArray);
        this.setState({ feedData: masterArray, lastRetrievedPostIndex: lastRetrievedPostIndex });
        console.log(lastRetrievedPostIndex);
    }

    fetchNextPosts() {
        console.log(this.state.lastRetrievedPostIndex);
        console.log(this.props.allPosts.length);
        if (this.state.lastRetrievedPostIndex + 24 >= this.props.allPosts.length) {
            this.setState({ hasMore: false });
            console.log("No More after this");
        }
        console.log("Fetching");
        AxiosHelper.returnMultiplePosts(
            this.props.targetProfileId,
            this.props.allPosts.slice(this.state.lastRetrievedPostIndex, this.state.lastRetrievedPostIndex + 24))
            .then(
                (result) => {
                    console.log("FUC");
                    console.log(result.data);
                    this.createTimelineRow(result.data);
                    // this.setState((state) => ({
                    //     feedData: state.feedData.concat(result.data)
                    // }));
                    // console.log(result.data);
                }
            )
            .catch((error) => console.log(error));

    }

    render() {
        console.log(this.props.allPosts);

        let timelineRows = this.state.feedData.map((item, index) => {
            return (
                <div className="flex-display" key={index}>
                    {item}
                </div>)
        }
        );

        // return (
        //     <div id="timeline-container">
        //         {timelineRows}
        //     </div>

        // );

        return (
            <div id="timeline-container">
                <InfiniteScroll
                    dataLength={24}
                    fixedDataLoadLength={24} //This is important field to render the next data
                    next={this.fetchNextPosts}
                    hasMore={this.state.hasMore}
                    loader={<h4>Loading...</h4>}
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                            <b>Yay! You have seen it all</b>
                        </p>
                    }
                // below props only if you need pull down functionality
                // refreshFunction={this.refresh}
                // pullDownToRefresh
                // pullDownToRefreshThreshold={16}
                // pullDownToRefreshContent={
                //     <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                // }
                // releaseToRefreshContent={
                //     <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                // }
                >
                    {timelineRows}
                </InfiniteScroll>
            </div>
        )
    }
}

export default Timeline;