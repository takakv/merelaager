import {
  regClosers,
  regUnits,
  addChild,
  fields,
  emsaFields,
  emsaNotice,
} from "./htmlElements.js";
import { hide } from "../registration.js";

const req = (element, isRequired) => {
  hide(element.parentElement, !isRequired);
  element.required = isRequired;
};

const requireUnit = (units, index, isRequired) =>
  units.forEach((unit) => (unit[index].required = isRequired));

// Fields to apply general required logic to.
const requiredFields = [
  fields.name,
  fields.idCode,
  fields.shift,
  fields.shirtSize,
  fields.road,
  fields.city,
  fields.country,
  fields.county,
];

// Display first card
export const displayFirstCard = () => {
  hide(regUnits[0], false);
  hide(regClosers[0], true);
  requireUnit(requiredFields, 0, true);
};

// Add cards.
export const addCard = (index) => {
  // Display logic.
  hide(regClosers[index - 1], true);
  hide(regUnits[index], false);
  if (index === 3) hide(addChild.parentElement, true);

  // Requirement logic.
  requireUnit(requiredFields, index, true);
};

// Remove cards.
export const removeCard = (index) => {
  // Display logic.
  hide(regUnits[index], true);
  if (index !== 1) hide(regClosers[index - 1], false);
  if (index === 3) hide(addChild.parentElement, false);

  // Requirement logic.
  requireUnit(requiredFields, index, false);
};

// Fields whose requirement setting depends on variables.
const statefulFields = [fields.gender, fields.birthday];

// Check for idCode field state.
for (let i = 0; i < 4; ++i) {
  fields.useId[i].addEventListener("change", (event) => {
    const isRequired = !!event.target.checked;
    req(fields.idCode[i], !isRequired);
    statefulFields.forEach((field) => {
      req(field[i], isRequired);
    });
  });
}

// Display EMSA notice to members.
let checkedCount = 0;
emsaFields.forEach((field) => {
  // Initialisation for cached reloads.
  if (field.checked) {
    ++checkedCount;
    hide(emsaNotice, false);
  }
  field.onclick = () => {
    if (field.checked) {
      hide(emsaNotice, false);
      ++checkedCount;
    } else {
      --checkedCount;
      if (!checkedCount) hide(emsaNotice, true);
    }
  };
});
