import React, { Component } from "react";

class ListHeadEntry extends Component {
  render() {
    return (
      <div className="c-cl-count">
        <span className="head">{this.props.keyName}: </span>
        {this.props.value}
      </div>
    );
  }
}

export class ListHead extends Component {
  render() {
    return (
      <div id={this.props.id} className="c-cl-head">
        <div className="c-cl-head__group c-cl-head__group-main">
          <ListHeadEntry
            keyName="poisid"
            value={this.props.shiftData.regBoyCount}
          />
          <ListHeadEntry
            keyName="tüdrukud"
            value={this.props.shiftData.regGirlCount}
          />
          <ListHeadEntry
            keyName="kokku"
            value={this.props.shiftData.totalCount}
          />
        </div>
        <div className="c-cl-head__group">
          <ListHeadEntry
            keyName="res. poisid"
            value={this.props.shiftData.resBoyCount}
          />
          <ListHeadEntry
            keyName="res. tüdrukud"
            value={this.props.shiftData.resGirlCount}
          />
        </div>
      </div>
    );
  }
}
