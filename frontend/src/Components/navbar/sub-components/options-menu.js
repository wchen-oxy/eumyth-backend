import React from 'react';
import { Link } from 'react-router-dom';
import { withFirebase } from '../../../Firebase';

import "./options-menu.scss";
class OptionsMenu extends React.Component {
    constructor() {
        super();

        this.state = {
            showMenu: false,
        };

        this.showMenu = this.showMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
    }

    showMenu(event) {
        event.preventDefault();

        this.setState({ showMenu: true }, () => {
            document.addEventListener('click', this.closeMenu);
        });
    }

    closeMenu() {
        this.setState({ showMenu: false }, () => {
            document.removeEventListener('click', this.closeMenu);
        });
    }

    render() {
        return (
            <div id="optionsmenu-main-container">
                <button onClick={this.showMenu}>
                    <h4>...</h4>
                </button>
                {
                    this.state.showMenu
                        ? (
                            <div id="optionsmenu-inner-menu-container">
                                <div className="optionsmenu-button-container">
                                    <Link to={"/account"}> Settings </Link>
                                </div>
                                <div className="optionsmenu-button-container">
                                    <button onClick={this.props.firebase.doSignOut}>
                                        <h4>Sign Out</h4>
                                    </button>
                                </div>
                            </div>
                        )
                        : (
                            null
                        )
                }
            </div>
        );
    }
}
export default withFirebase(OptionsMenu);