const dontUseIdCode = document.getElementById("hasIdCode");

const [
  regUnit1,
  regUnit2,
  regUnit3,
  regUnit4,
] = document.getElementsByClassName("registration-form__unit");
regUnit1.classList.remove("is-hidden");

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
