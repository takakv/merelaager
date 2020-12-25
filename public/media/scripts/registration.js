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

const calculatePrice = (children) => {
  let price = 0;
  children.forEach((child) => {
    price += child.shiftPrice;
    if (child.isFromTallinn) price -= 20;
    else if (child.isOld) price -= 10;
  });
  return price;
};

const displayPrice = (data) => {
  const price = calculatePrice(data);
  priceDisplay.innerText = price > 0 ? price : "---";
};

// --- Program
const regUnits = document.getElementsByClassName("registration-form__unit");
const regClosers = document.getElementsByClassName("registration-form__close");

let childrenCounter = 0;
hide(regUnits[childrenCounter], false);
hide(regClosers[childrenCounter], true);

const addChild = document.getElementById("addChild");
const childCountEl = document.getElementById("childCount");

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

// Require fields of first card.
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

const fullPrice = 290;
const shortPrice = 200;
let prePrice = 50;

const shiftPrices = {
  "1v": shortPrice,
  "2v": fullPrice,
  "3v": fullPrice,
  "4v": fullPrice,
};

const childrenPrices = [
  new ChildPrice(),
  new ChildPrice(),
  new ChildPrice(),
  new ChildPrice(),
];

for (let i = 0; i < 4; ++i) {
  const shift = fields.shift[i];
  const isNew = fields.isNew[i];
  const city = fields.city[i];
  shift.onchange = () => {
    childrenPrices[i].shiftPrice = shiftPrices[shift.value];
    displayPrice(childrenPrices);
  };
  isNew.onchange = () => {
    childrenPrices[i].isOld = !isNew.checked;
    displayPrice(childrenPrices);
  };
  city.onblur = () => {
    childrenPrices[i].isFromTallinn = city.value.toLowerCase() === "tallinn";
    displayPrice(childrenPrices);
  };
}

// Add cards.
addChild.onclick = () => {
  // Price logic.
  prePrice += 50;
  preDisplay.innerText = prePrice;

  // Display logic.
  hide(regClosers[childrenCounter], true);
  hide(regUnits[++childrenCounter], false);
  if (childrenCounter >= 3) hide(addChild.parentElement, true);

  // Requirement logic.
  requireUnit(requiredFields, childrenCounter, true);
  childCountEl.value = `${childrenCounter + 1}`;
};

// Remove cards.
for (let i = 1; i < 4; ++i) {
  regClosers[i].onclick = () => {
    // Price logic.
    prePrice -= 50;
    preDisplay.innerText = prePrice;

    // Requirement logic.
    requireUnit(requiredFields, childrenCounter, false);

    // Display logic.
    hide(regUnits[i], true);
    --childrenCounter;
    if (childrenCounter !== 0) hide(regClosers[childrenCounter], false);
    if (childrenCounter < 3) hide(addChild.parentElement, false);
  };
}
