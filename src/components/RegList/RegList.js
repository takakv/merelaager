import React, { Component, Suspense } from "react";
import campers from "./fetchCampers";
import { ListHead } from "./Support/List";
import { Table } from "./Support/Table";

const Display = () => {
  const shiftDataList = Object.entries(campers());
  const listSections = [
    ["Poisid", "regBoys"],
    ["Tüdrukud", "regGirls"],
    ["Reserv poisid", "resBoys"],
    ["Reserv tüdrukud", "resGirls"],
  ];
  const shifts = ["1v", "2v", "3v", "4v"];
  return (
    <div>
      {shifts.map((shift) => (
        <button id={`${shift}-switch`}>{shift}</button>
      ))}
      {shiftDataList.map((shift, index) => (
        <ListHead id={`${shift[0]}v-head`} shiftData={shift[1]} />
      ))}
      {shiftDataList.map((shift, index) => (
        <Table
          listSections={listSections}
          shiftData={shift[1]}
          tableId={`${++index}v-table`}
        />
      ))}
    </div>
  );
};

export default class RegList extends Component {
  render() {
    return (
      <Suspense fallback={<p>Laen...</p>}>
        <Display />
      </Suspense>
    );
  }
}
