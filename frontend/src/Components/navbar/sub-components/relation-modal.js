import React from 'react';
import AxiosHelper from '../../../Axios/axios';
import "./relation-model.scss";

const REQUEST = "REQUEST";
class RelationModal extends React.Component {
    _isMounted = false;

    constructor() {
        super();
        this.state = {
            userRelations: null
        }
    }

    componentDidMount() {
        this._isMounted = true;

        AxiosHelper.returnUserRelationInfo(this.props.username)
            .then((result) => {
                if (this._isMounted) { 
                    console.log(result.data);
                    this.setState({ userRelation: result.data }) }
            })
    }

    render() {

        return (
            <div id="relation-window">
                <span className="close" onClick={(() => this.props.closeModal(REQUEST))}>X</span>
                <div>
                    <div>
                        <p>Requests</p>
                    </div>
                    <div>
                        <p>Friends</p>
                    </div>
                </div>
            </div>


        );
    }
}

export default RelationModal;