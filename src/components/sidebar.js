import React, { Component } from "react";

export default class Sidebar extends Component {
    render() {
        return(
            <div className="c-sidebar">
                <a href="/kambyys/" className="c-sidebar-title">Kambüüs</a>
                <nav className="c-admin-nav">
                    <ul className="u-list-blank">
                        <li><a href="/kambyys/nimekiri/">Nimekiri</a></li>
                        <li><a href="/kambyys/arvegeneraator/">Arvegeneraator</a></li>
                        <li><a href="/kambyys/telgid/">Telgid</a></li>
                        <li><a href="/kambyys/lapsed/">Lapsed</a></li>
                    </ul>
                </nav>
            </div>
        )
    }
}
