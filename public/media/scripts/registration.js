const dontUseIdCode = document.getElementById("hasIdCode");
const addChild = document.getElementById("addChild");

const regUnits = document.getElementsByClassName("registration-form__unit");
let childrenCounter = 0;
regUnits[childrenCounter].classList.remove("is-hidden");

addChild.onclick = () => {
  regUnits[++childrenCounter].classList.remove("is-hidden");
  if (childrenCounter >= 3) addChild.parentElement.classList.add("is-hidden");
};

if (dontUseIdCode) {
  const idCodeField = document.getElementById("idcode");
  const gender = document.getElementById("gender-m");
  const bday = document.getElementById("bday");
  dontUseIdCode.addEventListener("change", (event) => {
    if (event.target.checked) {
      idCodeField.parentNode.classList.add("is-hidden");
      idCodeField.required = false;
      gender.parentNode.classList.remove("is-hidden");
      gender.required = true;
      bday.parentNode.classList.remove("is-hidden");
      bday.required = true;
    } else {
      idCodeField.parentNode.classList.remove("is-hidden");
      idCodeField.required = true;
      gender.parentNode.classList.add("is-hidden");
      gender.required = false;
      bday.parentNode.classList.add("is-hidden");
      bday.required = false;
    }
  });
}

const [registrationForm] = document.getElementsByClassName("registration-form");
