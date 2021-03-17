import React, { Component } from "react";

import Sidebar from "./components/sidebar.js";
import Userbox from "./components/userbox.js";
import Pagetile from "./components/pagetitle.js";

class Home extends React.Component {
    render() {
        return(
            <div className="admin-page">
                <Sidebar></Sidebar>
                <Pagetile title="Ahoi"></Pagetile>
                <Userbox name="Taaniel"></Userbox>
                <main role="main" className="c-content">
                    Stuff
                </main>
            </div>
        );
    }
}

ReactDOM.render(<Home />, document.getElementById('app'));
