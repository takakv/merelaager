import React, { Suspense } from "react";
import Sidebar from "./components/sidebar";
import Pagetile from "./components/pagetitle";
import Userbox from "./components/userbox";
import tents from "./components/tents";

const populateTents = (tentsList) => {
  const haveTents = [];
  for (let i = 1; i <= 10; ++i) {
      haveTents.push(tentsList[i]);
  }
  return haveTents;
};

const TentsList = () => {
  const tentsList = tents();
  const haveTents = populateTents(tentsList);
  console.log(haveTents);
  return (
    <div>
      <div className="c-tentless__container">
        {tentsList.noTent.map((camper, index) => (
          <div id={camper.id} className="c-tentless">
            <p>{camper.name}</p>
            <label htmlFor={`tentOptions-${index}`}>Telk</label>
            <select name="tent" id={`tentOptions-${index}`}>
              <option value="0">number</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>
        ))}
      </div>
      <div className="c-tent__container">
          {haveTents.map((tents, index) => (
              <div className="c-tent">
                  <p className="c-tent-header">{++index}</p>
                  <ul>
                      {tents.map(camper => (
                          <li id={`${camper.id}-rm`} className="u-list-blank c-tent-child">
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

const App = () => {
  return (
    <div className="admin-page">
      <Sidebar />
      <Pagetile />
      <Userbox />
      <main role="main" className="c-content">
        <Suspense fallback={<p>Laen...</p>}>
          <TentsList />
        </Suspense>
      </main>
    </div>
  );
};

export default App;
