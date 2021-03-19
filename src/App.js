import React, { Suspense, useState } from "react";
import { Switch, Route } from "react-router-dom";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import PageTitle from "./components/PageTitle";
import Userbox from "./components/userbox";
import RegList from "./components/RegList/RegList";
import TentsList from "./components/TentList/TentList";
import BillGen from "./components/BillGen";

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
          <Route path="/kambyys/arvegeneraator/">
            <BillGen />
          </Route>
          <Route path="/kambyys/telgid/">
            <TentsList />
          </Route>
        </Switch>
      </main>
    </div>
  );
}
