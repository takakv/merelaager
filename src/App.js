import React, { Suspense } from "react";
import Sidebar from "./components/sidebar";
import Pagetile from "./components/pagetitle";
import Userbox from "./components/userbox";
import tents from "./components/tents";

const TentsList = () => {
  const tentsList = tents();
  return <ul>{console.log(tentsList)}</ul>;
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
