import { regClosers, regUnits, addChild, fields } from "./htmlElements.js";

// --- functions
const hide = (element, isHidden) => {
  if (isHidden) element.classList.add("is-hidden");
  else element.classList.remove("is-hidden");
};

const require = (element, isRequired) => {
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
  console.log(index);
  // Display logic.
  hide(regUnits[index], true);
  if (index !== 1) hide(regClosers[index - 1], false);
  if (index === 3) hide(addChild.parentElement, false);

  // Requirement logic.
  requireUnit(requiredFields, index, false);
};
