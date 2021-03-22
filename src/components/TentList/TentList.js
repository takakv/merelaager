import React, { Component, Suspense } from "react";
import tents from "./fetchTents";

const populateTents = (tentsList) => {
  const haveTents = [];
  for (let i = 1; i <= 10; ++i) {
    haveTents.push(tentsList[i]);
  }
  return haveTents;
};

class TentBlockCamper extends Component {
  removeCamperFromTent = () => {
    const data = {
      id: this.props.camper.id,
      tent: null,
    };
    fetch(`${window.location.href}update/tent/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).catch((err) => alert(err));
  };

  render() {
    return (
      <li
        className="u-list-blank c-tent-child"
        onClick={this.removeCamperFromTent}
      >
        <span>{this.props.camper.name}</span>
        <div className="c-tent-child__rm">
          <div />
        </div>
      </li>
    );
  }
}

class TentBlock extends Component {
  render() {
    return (
      <div className="c-tent">
        <p className="c-tent-header">{this.props.tentNr}</p>
        <ul>
          {this.props.tents.map((camper) => (
            <TentBlockCamper
              tentNr={this.props.tentNr}
              camper={camper}
              key={camper.id}
            />
          ))}
        </ul>
      </div>
    );
  }
}

class NoTentCamper extends Component {
  addCamperToTent = (e) => {
    const data = {
      id: this.props.camper.id,
      tent: e.target.value,
    };
    fetch(`${window.location.href}update/tent/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).catch((err) => alert(err));
  };

  render() {
    // Populate the options dropdown for campers with a tent.
    const options = Array.from({ length: N }, (_, i) => i + 1);
    return (
      <div id={this.props.camper.id} className="c-tentless">
        <p>{this.props.camper.name}</p>
        <label htmlFor={`tentOptions-${this.props.index}`}>Telk</label>
        <select name="tent" onChange={this.addCamperToTent}>
          <option value="0" style={{ color: "grey" }}>
            number
          </option>
          {options.map((nr) => (
            <option value={nr} key={nr}>
              {nr}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

const Display = () => {
  const tentsList = tents();
  // The API response does not group tents into an array.
  const haveTents = populateTents(tentsList);
  return (
    <div>
      <div className="c-tentless__container">
        {tentsList.noTent.map((camper, index) => (
          <NoTentCamper camper={camper} index={index} key={camper.id} />
        ))}
      </div>
      <div className="c-tent__container">
        {haveTents.map((tents, index) => (
          <TentBlock tentNr={index + 1} tents={tents} key={index + 1} />
        ))}
      </div>
    </div>
  );
};

export default class TentList extends Component {
  render() {
    return (
      <Suspense fallback={<p>Laen...</p>}>
        <Display />
      </Suspense>
    );
  }
}
