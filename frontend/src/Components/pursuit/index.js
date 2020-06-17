import React from 'react';
import { useParams } from 'react-router-dom';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './pursuit-holder';
import './index.scss';
import AxiosHelper from '../../Axios/axios';


class PursuitProfile extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            username: this.props.match.params.username,
            private: false,
            pursuits: []
        }
    }

    componentDidMount() {
        this._isMounted = true;
        AxiosHelper.testString();
            AxiosHelper.returnPursuitNames(this.state.username)
                .then(
                    result => {
                    if (this._isMounted) {

                        this.setState({
                            pursuits: result.data.pursuits
                        })
                    }
                }

                );
        
    }

    componentWillUnmount() {
        this._isMounted = false;

    }
    render() {
        var pursuitHolderArray = [];

        for (const pursuit of this.state.pursuits) {
            pursuitHolderArray.push(
                <PursuitHolder pursuitData={pursuit} key={pursuit.name} value={pursuit.name} />
            );
        }
        return (
            <div className="pursuit-board-container">
                {pursuitHolderArray.map((pursuit) => pursuit)}
            </div>
        );

    }
}

export default withFirebase(PursuitProfile); 