// --- Imports
import { ChildPrice } from "./classes/ChildPrice.js";
import { validators } from "./regValidation.js";
import { addChild, regClosers } from "./registration/htmlElements.js";
import {
  addCard,
  displayFirstCard,
  removeCard,
} from "./registration/cardLogic.js";

validators();

// --- Functions

const calculatePrice = (children, count) => {
  let price = 0;
  for (let i = 0; i < count; ++i) {
    const child = children[i];
    price += child.shiftPrice;
    if (child.isFromTallinn) price -= 20;
    else if (child.isOld) price -= 10;
    console.log(child);
  }
  return price;
};

const displayPrice = (data, count) => {
  const price = calculatePrice(data, count);
  priceDisplay.innerText = price > 0 ? price : "---";
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

// Fields whose requirement setting depends on variables.
// const statefulFields = [fields.gender, fields.birthday];

const childCountEl = document.getElementById("childCount");

let childCount = childCountEl.value;
displayFirstCard();

// // Check for idCode field state.
// for (let i = 0; i < 4; ++i) {
//   fields.useId[i].addEventListener("change", (event) => {
//     const isRequired = !!event.target.checked;
//     require(fields.idCode[i], !isRequired);
//     statefulFields.forEach((field) => {
//       require(field[i], isRequired);
//     });
//   });
// }

// // Display EMSA notice to members.
// const emsaNotice = document.getElementById("emsa-notice");
// const emsaFields = [...document.getElementsByClassName("isEmsa")];
// let checkedCount = 0;
// emsaFields.forEach((field) => {
//   // Initialisation for cached reloads.
//   if (field.checked) {
//     ++checkedCount;
//     hide(emsaNotice, false);
//   }
//   field.onclick = () => {
//     if (field.checked) {
//       hide(emsaNotice, false);
//       ++checkedCount;
//     } else {
//       --checkedCount;
//       if (!checkedCount) hide(emsaNotice, true);
//     }
//   };
// });

const priceDisplay = document.getElementById("payment-total");
const preDisplay = document.getElementById("pre-total");
preDisplay.innerText = `${childCount * 50}`;

window.onunload = () => {};

// for (let i = 1; i < childCount; ++i) {
//   // Display logic.
//   hide(regClosers[i - 1], true);
//   hide(regUnits[i], false);
//   console.log(i);
//   if (i === 3) hide(addChild.parentElement, true);
//
//   // Requirement logic.
//   requireUnit(requiredFields, i, true);
// }

addChild.onclick = () => {
  addCard(childCount);
  ++childCount;
};
for (let i = 1; i < 4; ++i) {
  regClosers[i].onclick = () => {
    --childCount;
    removeCard(childCount);
  };
}
