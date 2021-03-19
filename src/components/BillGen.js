import React, { Component } from "react";

export default class BillGen extends Component {
  fetchPDF = (e) => {
    const target = e.target.id;
    const data = { meil: document.getElementById("mail").value };
    fetch(`${window.location}${target}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => ({
        filename: "arve.pdf",
        blob: await response.blob(),
      }))
      .then((obj) => {
        // const data = window.URL.createObjectURL(blob);
        // window.location.assign(data);
        // window.open(data);
        const newBlob = new Blob([obj.blob], { type: "application/pdf" });
        const objUrl = window.URL.createObjectURL(newBlob);
        // window.location.assign(objUrl);
        const link = document.createElement("a");
        link.href = objUrl;
        link.download = obj.filename;
        link.click();
      });
  };

  render() {
    return (
      <div>
        <label htmlFor="mail">Lapsevanema meil</label>
        <input type="email" name="meil" id="mail" />
        <button id="fetch" onClick={this.fetchPDF}>
          Leia
        </button>
        <button id="generate" onClick={this.fetchPDF}>
          Genereeri
        </button>
        <div className="u-banner u-banner--warning">
          <p>
            "Genereeri" asendab olemasoleva arve uuega (tänase kuupäevaga). Leia
            näitab viimast arvet.
          </p>
        </div>
      </div>
    );
  }
}
