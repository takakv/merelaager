import React, { Component } from "react";

const suspend = promise => {
    let result;
    let status = "pending";
    const suspender = promise.then(response => {
        status = "success";
        result = response;
    }, error => {
        status = "error";
        result = error;
    });

    return () => {
        switch(status) {
            case "pending":
                throw suspender;
            case "error":
                throw result;
            default:
                return result;
        }
    };
}

const getTentInfo = () =>
  fetch(`${window.location.href}api/tents/`).then((response) =>
    response.json()
  );

export default suspend(getTentInfo());