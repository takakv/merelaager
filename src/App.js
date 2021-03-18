import React from 'react';
import Sidebar from "./components/sidebar";
import Pagetile from "./components/pagetitle";
import Userbox from "./components/userbox";

const App = () => {
    return (
        <div className="admin-page">
            <Sidebar></Sidebar>
            <Pagetile></Pagetile>
            <Userbox></Userbox>
        </div>
    );
};

export default App;