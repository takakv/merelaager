export const regUnits = document.getElementsByClassName(
  "registration-form__unit"
);
export const regClosers = document.getElementsByClassName(
  "registration-form__close"
);
export const addChild = document.getElementById("addChild");

export const emsaNotice = document.getElementById("emsa-notice");
export const emsaFields = [...document.getElementsByClassName("isEmsa")];

export const fields = {
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

export const priceDisplay = document.getElementById("payment-total");
export const priceAffectingFields = [[...fields.shift], [...fields.isNew]];

export const submitButton = document.getElementById("submitBtn");
