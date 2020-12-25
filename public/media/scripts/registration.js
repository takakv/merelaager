// --- Imports
import { ChildPrice } from "./classes/ChildPrice.js";
import { validators } from "./regValidation.js";

validators();

// --- Functions
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

const regUnits = document.getElementsByClassName("registration-form__unit");
const regClosers = document.getElementsByClassName("registration-form__close");

const fields = {
  name: document.getElementsByClassName("nameField"),
  idCode: document.getElementsByClassName("idCodeField"),
  useId: document.getElementsByClassName("useIdCode"),
  gender: document.getElementsByClassName("genderField"),
  birthday: document.getElementsByClassName("birthdayField"),
  shift: document.getElementsByClassName("shiftField"),
  shirtSize: document.getElementsByClassName("shirtSizeField"),
  isNew: document.getElementsByClassName("newField"),
  road: document.getElementsByClassName("roadField"),
  city: document.getElementsByClassName("cityField"),
  country: document.getElementsByClassName("countryField"),
  county: document.getElementsByClassName("countyField"),
};

// Fields whose requirement setting depends on variables.
const statefulFields = [fields.gender, fields.birthday];

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
const childCountEl = document.getElementById("childCount");
const addChild = document.getElementById("addChild");

let childCount = childCountEl.value;
// Display first card
hide(regUnits[0], false);
hide(regClosers[0], true);
requireUnit(requiredFields, 0, true);

// Check for idCode field state.
for (let i = 0; i < 4; ++i) {
  fields.useId[i].addEventListener("change", (event) => {
    const isRequired = !!event.target.checked;
    require(fields.idCode[i], !isRequired);
    statefulFields.forEach((field) => {
      require(field[i], isRequired);
    });
  });
}

// Display EMSA notice to members.
const emsaNotice = document.getElementById("emsa-notice");
const emsaFields = [...document.getElementsByClassName("isEmsa")];
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

const priceDisplay = document.getElementById("payment-total");
const preDisplay = document.getElementById("pre-total");
preDisplay.innerText = `${childCount * 50}`;

window.onunload = () => {};

// Add cards.
const addCard = () => {
  // Display logic.
  hide(regClosers[childCount - 1], true);
  hide(regUnits[childCount], false);
  if (childCount === 3) hide(addChild.parentElement, true);

  // Requirement logic.
  requireUnit(requiredFields, childCount, true);
  childCountEl.value = `${++childCount}`;
  // sessionStorage.setItem("childCount", childCount);

  // Price logic.
  preDisplay.innerText = `${childCount * 50}`;
};

for (let i = 1; i < childCount; ++i) {
  // Display logic.
  hide(regClosers[i - 1], true);
  hide(regUnits[i], false);
  console.log(i);
  if (i === 3) hide(addChild.parentElement, true);

  // Requirement logic.
  requireUnit(requiredFields, i, true);
}

addChild.onclick = () => {
  addCard();
};

// Remove cards.
for (let i = 1; i < 4; ++i) {
  regClosers[i].onclick = () => {
    // Requirement logic.
    requireUnit(requiredFields, i, false);

    // Display logic.
    hide(regUnits[i], true);
    if (i !== 1) hide(regClosers[i - 1], false);
    if (childCount === 4) hide(addChild.parentElement, false);
    childCountEl.value = `${--childCount}`;

    // Price logic.
    preDisplay.innerText = `${childCount * 50}`;
  };
}
