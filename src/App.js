import React, { Suspense, useState } from "react";
import { Route } from "react-router-dom";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Pagetile from "./components/pagetitle";
import Userbox from "./components/userbox";
import tents from "./components/tents";
import campers from "./components/campers";

const populateTents = (tentsList) => {
  const haveTents = [];
  for (let i = 1; i <= 10; ++i) {
    haveTents.push(tentsList[i]);
  }
  return haveTents;
};

const TentsList = () => {
  const tentsList = tents();
  // The API response does not group tents into an array.
  const haveTents = populateTents(tentsList);
  // Populate the options dropdown for campers with a tent.
  const options = [];
  for (let i = 1; i <= 10; ++i) {
    options.push(i);
  }
  return (
    <div>
      <div className="c-tentless__container">
        {tentsList.noTent.map((camper, index) => (
          <div id={camper.id} className="c-tentless">
            <p>{camper.name}</p>
            <label htmlFor={`tentOptions-${index}`}>Telk</label>
            <select name="tent" id={`tentOptions-${index}`}>
              <option value="0">number</option>
              {options.map((nr) => (
                <option value={nr}>{nr}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="c-tent__container">
        {haveTents.map((tents, index) => (
          <div className="c-tent">
            <p className="c-tent-header">{++index}</p>
            <ul>
              {tents.map((camper) => (
                <li
                  id={`${camper.id}-rm`}
                  className="u-list-blank c-tent-child"
                >
                  <span>{camper.name}</span>
                  <div className="c-tent-child__rm">
                    <div></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const Reglist = () => {
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
        <div id={`${shift[0]}v-head`} className="c-cl-head">
          <div className="c-cl-head__group c-cl-head__group-main">
            <div className="c-cl-count">
              <span className="head">poisid: </span>
              {shift[1].regBoyCount}
            </div>
            <div className="c-cl-count">
              <span className="head">tüdrukud: </span>
              {shift[1].regGirlCount}
            </div>
            <div className="c-cl-count">
              <span className="head">kokku: </span>
              {shift[1].totalCount}
            </div>
          </div>
          <div className="c-cl-head__group">
            <div className="c-cl-count">
              <span className="head">res. poisid: </span>
              {shift[1].resBoyCount}
            </div>
            <div className="c-cl-count">
              <span className="head">res. tüdrukud: </span>
              {shift[1].resGirlCount}
            </div>
          </div>
        </div>
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
                      value={kid.pricePaid}
                    />
                  </td>
                  <td>
                    <input
                      id={`${kid.id}-toPay`}
                      className="priceToPay"
                      type="text"
                      value={kid.priceToPay}
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

export default function App() {
  const [token, setToken] = useState();

  // if (!token) {
  //   return <Login setTokn={setToken} />;
  // }

  return (
    <div className="admin-page">
      <Sidebar />
      <Pagetile />
      <Userbox />
      <main role="main" className="c-content">
        <Route path="/nimekiri/">
          <Suspense fallback={<p>Laen...</p>}>
            <Reglist />
          </Suspense>
        </Route>
        <Route path="/telgid/">
          <Suspense fallback={<p>Laen...</p>}>
            <TentsList />
          </Suspense>
        </Route>
      </main>
    </div>
  );
}
