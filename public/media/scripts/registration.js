const hide = (element, isHidden) => {
  if (isHidden) element.classList.add("is-hidden");
  else element.classList.remove("is-hidden");
};

const require = (element, isRequired) => {
  hide(element.parentElement, !isRequired);
  element.required = isRequired;
};

const requireUnit = (units, index, isRequired) =>
  Object.values(units).forEach((unit) => (unit[index].required = isRequired));

const regUnits = document.getElementsByClassName("registration-form__unit");
const regClosers = document.getElementsByClassName("registration-form__close");

let childrenCounter = 0;
hide(regUnits[childrenCounter], false);
hide(regClosers[childrenCounter], true);

const addChild = document.getElementById("addChild");
const childCountEl = document.getElementById("childCount");
// These fields have their own checkbox logic.
const noIds = document.getElementsByClassName("hasIdCode");
const genderFields = document.getElementsByClassName("genderField");
const birthdayFields = document.getElementsByClassName("birthdayField");
// These fields have global required logic.
const fields = {
  nameFields: document.getElementsByClassName("nameField"),
  idCodeFields: document.getElementsByClassName("idCodeField"),
  shiftFields: document.getElementsByClassName("shiftField"),
  shirtSizeFields: document.getElementsByClassName("shirtSizeField"),
  yearFields: document.getElementsByClassName("yearField"),
  cityFields: document.getElementsByClassName("cityField"),
  countyFields: document.getElementsByClassName("countyField"),
  countryFields: document.getElementsByClassName("countryField"),
};

addChild.onclick = () => {
  hide(regClosers[childrenCounter], true);
  hide(regUnits[++childrenCounter], false);
  requireUnit(fields, childrenCounter, true);
  childCountEl.value = `${childrenCounter + 1}`;
  if (childrenCounter >= 3) hide(addChild.parentElement, true);
};

for (let i = 0; i < 4; ++i) {
  noIds[i].addEventListener("change", (event) => {
    const isRequired = !!event.target.checked;
    require(fields.idCodeFields[i], !isRequired);
    require(genderFields[i], isRequired);
    require(birthdayFields[i], isRequired);
  });
}

for (let i = 1; i < 4; ++i) {
  requireUnit(fields, i, false);
  regClosers[i].onclick = () => {
    hide(regUnits[i], true);
    requireUnit(fields, childrenCounter, false);
    --childrenCounter;
    if (childrenCounter !== 0) hide(regClosers[childrenCounter], false);
    if (childrenCounter < 3) hide(addChild.parentElement, false);
  };
}