const addChild = document.getElementById("addChild");
const childCountEl = document.getElementById("childCount");

const regUnits = document.getElementsByClassName("registration-form__unit");
let childrenCounter = 0;
regUnits[childrenCounter].classList.remove("is-hidden");

addChild.onclick = () => {
  regUnits[++childrenCounter].classList.remove("is-hidden");
  childCountEl.value = `${childrenCounter + 1}`;
  if (childrenCounter >= 3) addChild.parentElement.classList.add("is-hidden");
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

const require = (element, isRequired) => {
  if (isRequired) {
    element.parentElement.classList.remove("is-hidden");
    element.required = true;
  } else {
    element.parentElement.classList.add("is-hidden");
    element.required = false;
  }
};
