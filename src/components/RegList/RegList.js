import React, { Component, Suspense, useState } from "react";
import campers from "./fetchCampers";
import { ListHead } from "./Support/List";
import { Table } from "./Support/Table";

class Display extends Component {
  constructor(props) {
    super(props);
    this.state = { shift: 1 };
  }

  handleShiftChange = (e) => {
    this.setState({ shift: parseInt(e.target.innerHTML) });
  };

  render() {
    const shift = this.state.shift;
    const shiftDataList = Object.entries(campers());
    const listSections = [
      ["Poisid", "regBoys"],
      ["Tüdrukud", "regGirls"],
      ["Reserv poisid", "resBoys"],
      ["Reserv tüdrukud", "resGirls"],
    ];
    let shiftData = shiftDataList[shift - 1][1];
    let listHead = <ListHead shiftData={shiftData} />;
    let table = <Table listSections={listSections} shiftData={shiftData} />;
    return (
      <div className="camper-list">
        {[1, 2, 3, 4].map((shift) => (
          <button onClick={this.handleShiftChange}>{shift}</button>
        ))}
        {listHead}
        {table}
      </div>
    );
  }
}

export default class RegList extends Component {
  render() {
    return (
      <Suspense fallback={<p>Laen...</p>}>
        <Display />
      </Suspense>
    );
  }
}
