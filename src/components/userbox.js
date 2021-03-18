import React, { Component } from "react";

export default class Userbox extends Component {
    render() {
        return(
            <div className="admin-page__user">
                <span>{this.props.name}</span>
            </div>
        )
    }
}
