import React, { Component } from "react";

export default class Pagetile extends Component {
    render() {
        return(
            <div className="admin-page__title">
                <span>{this.props.title}</span>
            </div>
        )
    }
}
