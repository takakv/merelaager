import React, { Component } from "react";

export default class PageTile extends Component {
  render() {
    return (
      <div className="admin-page__title">
        <span>{this.props.title}</span>
      </div>
    );
  }
}
