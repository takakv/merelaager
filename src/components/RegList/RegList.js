import React, { Component, Suspense } from "react";
import campers from "./fetchCampers";

class ListHead extends Component {
  render() {
    return (
      <div id={this.props.id} className="c-cl-head">
        <div className="c-cl-head__group c-cl-head__group-main">
          <div className="c-cl-count">
            <span className="head">poisid: </span>
            {this.props.shiftData.regBoyCount}
          </div>
          <div className="c-cl-count">
            <span className="head">tüdrukud: </span>
            {this.props.shiftData.regGirlCount}
          </div>
          <div className="c-cl-count">
            <span className="head">kokku: </span>
            {this.props.shiftData.totalCount}
          </div>
        </div>
        <div className="c-cl-head__group">
          <div className="c-cl-count">
            <span className="head">res. poisid: </span>
            {this.props.shiftData.resBoyCount}
          </div>
          <div className="c-cl-count">
            <span className="head">res. tüdrukud: </span>
            {this.props.shiftData.resGirlCount}
          </div>
        </div>
      </div>
    );
  }
}

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
      {shiftDataList.map((shift) => (
        <ListHead id={`${shift[0]}v-head`} shiftData={shift[1]} />
      ))}
      {shiftDataList.map((shift, index) => (
        <table id={`${++index}v-table`} className="c-camper-table">
          <thead>
            <tr>
              <th>Reg ID</th>
              <th>Reg?</th>
              <th>Nimi</th>
              <th>Makstud</th>
              <th>Kogusumma</th>
              <th>Kontakt</th>
              <th>Vana?</th>
              <th>Sünnipäev</th>
              <th>Ts</th>
              <th>Tln?</th>
              <th>Arve nr</th>
              <th>Isikukood</th>
            </tr>
          </thead>
          {listSections.map((section) => (
            <tbody>
              <tr>
                <td colSpan="14">{section[0]}</td>
              </tr>
              {shift[1][section[1]].map((kid) => (
                <tr>
                  <td>{kid.id}</td>
                  <td>
                    <button
                      id={`${kid.id}-reg`}
                      className={`state ${kid.registered} clicker`}
                    />
                  </td>
                  <td>{kid.name}</td>
                  <td>
                    <input
                      id={`${kid.id}-paid`}
                      className="price"
                      type="text"
                      defaultValue={kid.pricePaid}
                    />
                  </td>
                  <td>
                    <input
                      id={`${kid.id}-toPay`}
                      className="priceToPay"
                      type="text"
                      defaultValue={kid.priceToPay}
                    />
                  </td>
                  <td id={`${kid.id}-contact`} className="c-camper-contact">
                    <a
                      href={`mailto:${kid.contactEmail}`}
                      className="c-caper-contact__name"
                    >
                      {kid.contactName}
                    </a>
                    <span className="c-camper-contact__phone">
                      {kid.contactNumber}
                    </span>
                  </td>
                  <td>
                    <button
                      id={`${kid.id}-old`}
                      className={`state ${kid.isOld} clicker`}
                    >
                      {kid.isOld}
                    </button>
                  </td>
                  <td style={{ fontFamily: "monospace" }}>{kid.bDay}</td>
                  <td>{kid.tShirtSize}</td>
                  <td>{kid.tln}</td>
                  <td style={{ fontFamily: "monospace" }}>{kid.billNr}</td>
                  <td style={{ fontFamily: "monospace" }}>{kid.idCode}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
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
