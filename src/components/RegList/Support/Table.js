import React, { Component } from "react";

const switchStatus = (target) => {
  const status = target.innerText;
  if (status === "ei") {
    target.innerText = "jah";
    target.classList.remove("ei");
    target.classList.add("jah");
  } else {
    target.innerText = "ei";
    target.classList.remove("jah");
    target.classList.add("ei");
  }
};

class TableHeader extends Component {
  render() {
    return (
      <thead>
        <tr>
          <th>Reg ID</th>
          <th>Reg?</th>
          <th>Nimi</th>
          <th>Makstud</th>
          <th>Kogusumma</th>
          <th>Kontakt</th>
          <th>Vana?</th>
          <th>Sünnipäev</th>
          <th>Ts</th>
          <th>Tln?</th>
          <th>Arve nr</th>
          <th>Isikukood</th>
        </tr>
      </thead>
    );
  }
}

class TableSection extends Component {
  updateStatus = (e) => {
    const data = {
      id: e.target.id,
    };
    switchStatus(e.target);
    fetch(`${window.location.href}update/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).catch((err) => alert(err));
  };

  updatePrices = async (e) => {
    const data = {
      id: e.target.id,
      value: e.target.value,
    };
    try {
      const response = await fetch(`${window.location.href}update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        e.target.classList.add("ok");
        setTimeout(() => {
          e.target.classList.remove("ok");
        }, 3000);
      } else {
        e.target.classList.add("nop");
        setTimeout(() => {
          e.target.classList.remove("nop");
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      alert("Midagi läks nihu. Palun anna Taanielile teada :)");
    }
  };

  render() {
    return (
      <tbody>
        <tr>
          <td colSpan="14">{this.props.title}</td>
        </tr>
        {this.props.sectionData.map((kid) => (
          <tr>
            <td>{kid.id}</td>
            <td>
              <button
                id={`${kid.id}-reg`}
                className={`state ${kid.registered}`}
                onClick={this.updateStatus}
              >
                {kid.registered}
              </button>
            </td>
            <td>{kid.name}</td>
            <td>
              <input
                id={`${kid.id}-paid`}
                className="price"
                type="text"
                defaultValue={kid.pricePaid}
                onBlur={this.updatePrices}
              />
            </td>
            <td>
              <input
                id={`${kid.id}-toPay`}
                className="priceToPay"
                type="text"
                defaultValue={kid.priceToPay}
                onBlur={this.updatePrices}
              />
            </td>
            <td id={`${kid.id}-contact`} className="c-camper-contact">
              <a
                href={`mailto:${kid.contactEmail}`}
                className="c-caper-contact__name"
              >
                {kid.contactName}
              </a>
              <span className="c-camper-contact__phone">
                {kid.contactNumber}
              </span>
            </td>
            <td>
              <button
                id={`${kid.id}-old`}
                className={`state ${kid.isOld}`}
                onClick={this.updateStatus}
              >
                {kid.isOld}
              </button>
            </td>
            <td style={{ fontFamily: "monospace" }}>{kid.bDay}</td>
            <td>{kid.tShirtSize}</td>
            <td>{kid.tln}</td>
            <td style={{ fontFamily: "monospace" }}>{kid.billNr}</td>
            <td style={{ fontFamily: "monospace" }}>{kid.idCode}</td>
          </tr>
        ))}
      </tbody>
    );
  }
}

export class Table extends Component {
  render() {
    return (
      <table className="c-camper-table">
        <TableHeader />
        {this.props.listSections.map((section) => (
          <TableSection
            title={section[0]}
            sectionData={this.props.shiftData[section[1]]}
          />
        ))}
      </table>
    );
  }
}
