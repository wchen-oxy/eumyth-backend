import React from "react";

const INITIAL = "INITIAL";

class ProjectController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            window: INITIAL
        }
    }

    render(){
        return(
            <div>
                TEST
            </div>
        )
    }
}

export default ProjectController;