const nameFields = [...document.getElementsByClassName("nameField")];
const parentNameField = document.getElementById("guardian_name");

const idCodeFields = [...document.getElementsByClassName("idCodeField")];

const nameValidity = (value) => {
  if (value.trim().indexOf(" ") === -1) return 1;
  if (value.match(/\d/g)) return 2;
  return 0;
};

const idValidity = (value) => {
  if (value.length !== 11 || !value.match(/[0-9]/g)) return 1;
  if (value[0] !== "5" && value[0] !== "6") return 2;
  const year = parseInt(value.slice(1, 3));
  const month = parseInt(value.slice(3, 5));
  const day = parseInt(value.slice(5, 7));
  if (year > 20) return 3;
  if (month === 0 || month > 12) return 4;
  if (day === 0 || day > 31) return 5;
  return 0;
};

const needsChecking = (field) => {
  return field.required && field.value;
};

const setNameValidity = (field) => {
  if (!needsChecking(field)) return;
  switch (nameValidity(field.value)) {
    case 1:
      field.setCustomValidity("Palun kasutage täisnime.");
      break;
    case 2:
      field.setCustomValidity("Nimi ei või sisaldada numbreid.");
      break;
    default:
      field.setCustomValidity("");
      break;
  }
};

const setIdValidity = (field) => {
  if (!needsChecking(field)) return;
  switch (idValidity(field.value)) {
    case 1:
      field.setCustomValidity("Eesti isikukoodkood koosneb 11. numbrist.");
      break;
    case 2:
      field.setCustomValidity("Lapse isikukood algab kas viie või kuuega.");
      break;
    case 3:
      field.setCustomValidity("Sünniaasta ei ole lubatud.");
      break;
    case 4:
      field.setCustomValidity("Sünnikuu on vahemikus 1 - 12.");
      break;
    case 5:
      field.setCustomValidity("Sünnipäev on vahemikus 1 - 31.");
      break;
    default:
      field.setCustomValidity("");
      break;
  }
};

export const validators = () => {
  nameFields.forEach((field) => {
    field.onblur = () => {
      setNameValidity(field);
      if (needsChecking(field)) field.reportValidity();
    };
  });
  idCodeFields.forEach((field) => {
    field.onblur = () => {
      setIdValidity(field);
      if (needsChecking(field)) field.reportValidity();
    };
  });
  parentNameField.onblur = () => {
    setNameValidity(parentNameField);
    if (needsChecking(parentNameField)) parentNameField.reportValidity();
  };
};
