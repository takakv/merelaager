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

let childrenCounter = 0;
hide(regUnits[childrenCounter], false);

const addChild = document.getElementById("addChild");
const childCountEl = document.getElementById("childCount");
const fields = {
  nameFields: document.getElementsByClassName("nameField"),
  idCodeFields: document.getElementsByClassName("idCodeField"),
  noIds: document.getElementsByClassName("hasIdCode"),
  genderFields: document.getElementsByClassName("genderField"),
  birthdayFields: document.getElementsByClassName("birthdayField"),
  shiftFields: document.getElementsByClassName("shiftField"),
  shirtSizeFields: document.getElementsByClassName("shirtSizeField"),
  yearFields: document.getElementsByClassName("yearField"),
  cityFields: document.getElementsByClassName("cityField"),
  countyFields: document.getElementsByClassName("countyField"),
  countryFields: document.getElementsByClassName("countryField"),
};

addChild.onclick = () => {
  hide(regUnits[++childrenCounter], false);
  requireUnit(fields, childrenCounter, true);
  childCountEl.value = `${childrenCounter + 1}`;
  if (childrenCounter >= 3) hide(addChild.parentElement, true);
};

for (let i = 1; i < 4; ++i) requireUnit(fields, i, false);

for (let i = 0; i < 4; ++i)
  fields.noIds[i].addEventListener("change", (event) => {
    const isRequired = !!event.target.checked;
    require(fields.idCodeFields[i], !isRequired);
    require(fields.genderFields[i], isRequired);
    require(fields.birthdayFields[i], isRequired);
  });
