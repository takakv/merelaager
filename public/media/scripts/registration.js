// --- Imports
import { updatePrice } from "./registration/price.js";
import { validators } from "./registration/validation.js";
import {
  addChild,
  regClosers,
  priceAffectingFields,
  priceDisplay,
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

if (window.location.hostname !== "merelaager.ee") submitButton.disabled = false;

window.onunload = () => {};
