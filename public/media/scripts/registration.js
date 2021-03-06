// --- Imports
import { updatePrice } from "./registration/price.js";
import { validators } from "./registration/validation.js";
import {
  addChild,
  priceAffectingFields,
  priceDisplay,
  regClosers,
  submitButton,
} from "./registration/htmlElements.js";
import {
  addCard,
  displayFirstCard,
  removeCard,
} from "./registration/cardLogic.js";

// --- Functions
export const hide = (element, isHidden) => {
  if (isHidden) element.classList.add("is-hidden");
  else element.classList.remove("is-hidden");
};

// --- Program
const pageAccessedByReload =
  (window.performance.navigation && window.performance.navigation.type === 1) ||
  window.performance
    .getEntriesByType("navigation")
    .map((nav) => nav.type)
    .includes("reload");

if (pageAccessedByReload) {
  document.getElementById("regform").reset();
}

displayFirstCard();
validators();

const childCountEl = document.getElementById("childCount");
let childCount = childCountEl.value;

const preDisplay = document.getElementById("pre-total");
preDisplay.innerText = `${childCount * 50}`;

addChild.onclick = () => {
  addCard(childCount);
  ++childCount;
  childCountEl.value = childCount;
  preDisplay.innerText = `${childCount * 50}`;
  priceDisplay.innerText = `${parseInt(priceDisplay.innerText) + 50}`;
};

for (let i = 1; i < 4; ++i) {
  regClosers[i].onclick = () => {
    --childCount;
    childCountEl.value = childCount;
    removeCard(childCount);
    preDisplay.innerText = `${childCount * 50}`;
    priceDisplay.innerText = `${parseInt(priceDisplay.innerText) - 50}`;
  };
}

for (let i = 1; i < childCount; ++i) {
  addCard(i);
}

updatePrice(childCount);
priceDisplay.innerText = `${
  parseInt(priceDisplay.innerText) + childCount * 50
}`;

priceAffectingFields.forEach((fields) => {
  fields.forEach((field) => {
    field.onchange = () => {
      updatePrice(childCount);
    };
  });
});

const unlocker = (moment) => {
  const unlockDate = new Date(Date.parse(moment)).getTime();
  const now = new Date().getTime();

  if (now > unlockDate) {
    submitButton.disabled = false;
    return;
  }

  const eta = unlockDate - now;
  setTimeout(() => {
    submitButton.disabled = false;
  }, eta);
};

if (window.location.hostname === "merelaager.ee") {
  unlocker("01 Jan 2021 12:00:00 UTC");
} else {
  unlocker("01 Jan 2021 11:04:00 UTC");
}

const source = new EventSource("/registreerimine/events/");
const shiftSpots = [...document.getElementsByClassName("vahetuste-kohad")];
source.onmessage = (event) => {
  const parsedData = JSON.parse(event.data);
  for (let i = 0; i < 4; ++i) {
    const boysCount = parsedData[i + 1].boys > 0 ? parsedData[i + 1].boys : 0;
    const girlsCount =
      parsedData[i + 1].girls > 0 ? parsedData[i + 1].girls : 0;
    shiftSpots[i].children[1].innerText = `Poisid: 0`;
    shiftSpots[i].children[2].innerText = `Tüdrukud: 0`;
    // shiftSpots[i].children[1].innerText = `Poisid: ${boysCount}`;
    // shiftSpots[i].children[2].innerText = `Tüdrukud: ${girlsCount}`;
  }
};

window.onunload = () => {};
