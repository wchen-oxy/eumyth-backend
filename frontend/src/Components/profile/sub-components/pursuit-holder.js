import React from 'react';
import { withRouter } from 'react-router-dom';


const PursuitHolder = (props) =>

    (
        <div className="pursuit-container no-select" key={props.name} onClick={() => props.onFeedSwitch(props.value)}>
            <h4>
                {props.name}
            </h4>
            {
                props.numEvents ? <p>  Events: {props.numEvents}  </p> : <></>
            }

        </div>
    );




export default withRouter(PursuitHolder);