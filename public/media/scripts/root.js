const newSiteNotice = document.getElementById("newsite-notice");
const closeNewSiteNotice = document.getElementById("newsite-notice-x");

const displayNewSiteNotice = localStorage.getItem("hasClosed");

if (!displayNewSiteNotice) {
  newSiteNotice.classList.add("is-active");
}

closeNewSiteNotice.onclick = () => {
  newSiteNotice.classList.remove("is-active");
  localStorage.setItem("hasClosed", "true");
};

const dontUseIdCode = document.getElementById("hasIdCode");
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
