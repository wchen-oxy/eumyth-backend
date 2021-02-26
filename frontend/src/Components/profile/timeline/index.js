import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Event from './sub-components/timeline-event';
import AxiosHelper from '../../../Axios/axios';
import { PROJECT } from "../../constants/flags";
import './index.scss';

class Timeline extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
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
            this.fetchNextPosts(this.props.allPosts);
        }
        else {
            this.setState({ hasMore: false });
        }
    }

    createTimelineRow(inputArray, mediaType) {
        let masterArray = this.state.feedData;
        let index = masterArray.length - 1; //index position of array in masterArray
        let nextOpenPostIndex = this.state.nextOpenPostIndex;

        let j = 0;
        let k = masterArray[index].length; //length of last array 
        //while input array is not empty
        while (j < inputArray.length) {
            //while the last sub array is not empty
            while (k < 4) {
                let isSelected = false;
                if (!inputArray[j]) break; //if we finish...
                if (this.props.selectedPosts) {
                    for (const selected of this.props.selectedPosts) {
                        if (selected.key === inputArray[j]._id) isSelected = true;
                    }
                }
                masterArray[index].push(
                    <Event
                        index={k}
                        mediaType={mediaType}
                        isSelected={isSelected}
                        newProjectView={this.props.newProjectView}
                        key={nextOpenPostIndex}
                        eventIndex={nextOpenPostIndex}
                        eventData={inputArray[j]}
                        onEventClick={this.props.onEventClick}
                        onProjectClick={this.props.onProjectClick}
                        onProjectEventSelect={this.props.onProjectEventSelect}
                    />
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
        this.setState({
            feedData: masterArray,
            nextOpenPostIndex: nextOpenPostIndex
        });
    }

    fetchNextPosts() {
        if (this.state.nextOpenPostIndex + this.state.fixedDataLoadLength
            >= this.props.allPosts.length) {
            console.log("Length of All Posts Exceeded");
            this.setState({ hasMore: false });
        }
        if (this.props.mediaType === PROJECT) {
            return AxiosHelper.returnMultipleProjects(
                this.props.allPosts.slice(
                    this.state.nextOpenPostIndex,
                    this.state.nextOpenPostIndex + this.state.fixedDataLoadLength))
                .then(
                    (result) => {
                        console.log(result.data);
                        if (this._isMounted) {
                            this.createTimelineRow(
                                result.data,
                                this.props.mediaType);
                        }
                    }
                )
                .catch((error) => console.log(error));
        }
        else {
            return AxiosHelper.returnMultiplePosts(
                this.props.allPosts.slice(
                    this.state.nextOpenPostIndex,
                    this.state.nextOpenPostIndex + this.state.fixedDataLoadLength),
                false)
                .then((result) => {
                    if (this._isMounted) {
                        this.createTimelineRow(
                            result.data.posts,
                            this.props.mediaType);
                    }
                }
                )
                .catch((error) => console.log(error));
        }
    }

    render() {
        const endMessage = (
            <div>
                <br />
                <p style={{ textAlign: 'center' }}>
                    Yay! You have seen it all
            </p>
            </div>
        )
        if (!this._isMounted || !this.props.allPosts) return (
            <div>
                <p>Loading</p>
            </div>
        );
        return (
            <div>
                {this.props.allPosts && this.props.allPosts.length > 0 ?
                    (<InfiniteScroll
                        dataLength={this.state.nextOpenPostIndex}
                        next={this.fetchNextPosts}
                        hasMore={this.state.hasMore}
                        loader={<h4>Loading...</h4>}
                        endMessage={endMessage}>
                        {this.state.feedData.map((item, index) => (
                            <div
                                className="timeline-infinite-scroll-row"
                                key={index}
                            >
                                {item}
                            </div>
                        ))}
                        <br />
                    </InfiniteScroll>
                    )
                    :
                    <p>There doesn't seem to be anything here</p>
                }
            </div>
        )
    }
}

export default Timeline;