import React, { Suspense, useState } from "react";
import { Switch, Route } from "react-router-dom";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import PageTitle from "./components/PageTitle";
import Userbox from "./components/userbox";
import RegList from "./components/RegList/RegList";
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

export default function App() {
  const [token, setToken] = useState();

  // if (!token) {
  //   return <Login setTokn={setToken} />;
  // }

  return (
    <div className="admin-page">
      <Sidebar />
      <PageTitle title="Ahoi" />
      <Userbox />
      <main role="main" className="c-content">
        <Switch>
          <Route path="/kambyys/nimekiri/">
            <RegList />
          </Route>
          <Route path="/kambyys/telgid/">
            <Suspense fallback={<p>Laen...</p>}>
              <TentsList />
            </Suspense>
          </Route>
        </Switch>
      </main>
    </div>
  );
}
