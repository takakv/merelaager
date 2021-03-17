var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';

var Home = function (_Component) {
    _inherits(Home, _Component);

    function Home() {
        _classCallCheck(this, Home);

        return _possibleConstructorReturn(this, (Home.__proto__ || Object.getPrototypeOf(Home)).apply(this, arguments));
    }

    _createClass(Home, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "admin-page" },
                React.createElement(
                    "div",
                    { className: "c-sidebar" },
                    React.createElement(
                        "a",
                        { href: "/kambyys/", className: "c-sidebar-title" },
                        "Kamb\xFC\xFCs"
                    ),
                    React.createElement(
                        "nav",
                        { className: "c-admin-nav" },
                        React.createElement(
                            "ul",
                            { className: "u-list-blank" },
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "a",
                                    { href: "/kambyys/nimekiri/" },
                                    "Nimekiri"
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "a",
                                    { href: "/kambyys/arvegeneraator/" },
                                    "Arvegeneraator"
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "a",
                                    { href: "/kambyys/telgid/" },
                                    "Telgid"
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "a",
                                    { href: "/kambyys/lapsed/" },
                                    "Lapsed"
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "admin-page__title" },
                    React.createElement(
                        "span",
                        null,
                        "Ahoi"
                    )
                ),
                React.createElement(
                    "div",
                    { className: "admin-page__user" },
                    React.createElement(
                        "span",
                        null,
                        "Taka"
                    )
                ),
                React.createElement(
                    "main",
                    { role: "main", className: "c-content" },
                    "Stuff"
                )
            );
        }
    }]);

    return Home;
}(Component);

export default Home;