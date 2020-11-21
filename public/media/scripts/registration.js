const hide = (element, isHidden) => {
  if (isHidden) element.classList.add("is-hidden");
  else element.classList.remove("is-hidden");
};

const require = (element, isRequired) => {
  hide(element.parentElement, !isRequired);
  element.required = isRequired;
};

const regUnits = document.getElementsByClassName("registration-form__unit");

let childrenCounter = 0;
hide(regUnits[childrenCounter], false);

const addChild = document.getElementById("addChild");
const childCountEl = document.getElementById("childCount");

addChild.onclick = () => {
  hide(regUnits[++childrenCounter], false);
  childCountEl.value = `${childrenCounter + 1}`;
  if (childrenCounter >= 3) hide(addChild.parentElement, true);
};

const idCodeFields = document.getElementsByClassName("idCodeField");
const noIds = document.getElementsByClassName("hasIdCode");
const genders = document.getElementsByClassName("genderRoot");
const birthdays = document.getElementsByClassName("birthday");

for (let i = 0; i < 4; ++i) {
  noIds[i].addEventListener("change", (event) => {
    const isRequired = !!event.target.checked;
    require(idCodeFields[i], !isRequired);
    require(genders[i], isRequired);
    require(birthdays[i], isRequired);
  });
}
