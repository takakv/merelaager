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

const idCodeField1 = document.getElementById("idCode-1");
const idCodeField2 = document.getElementById("idCode-2");
const idCodeField3 = document.getElementById("idCode-3");
const idCodeField4 = document.getElementById("idCode-4");
const idCodeFields = [idCodeField1, idCodeField2, idCodeField3, idCodeField4];

const noId1 = document.getElementById("hasIdCode-1");
const noId2 = document.getElementById("hasIdCode-2");
const noId3 = document.getElementById("hasIdCode-3");
const noId4 = document.getElementById("hasIdCode-4");
const noIds = [noId1, noId2, noId3, noId4];

const gender1 = document.getElementById("gender-m-1");
const gender2 = document.getElementById("gender-m-2");
const gender3 = document.getElementById("gender-m-3");
const gender4 = document.getElementById("gender-m-4");
const genders = [gender1, gender2, gender3, gender4];

const bDay1 = document.getElementById("bDay-1");
const bDay2 = document.getElementById("bDay-2");
const bDay3 = document.getElementById("bDay-3");
const bDay4 = document.getElementById("bDay-4");
const bDays = [bDay1, bDay2, bDay3, bDay4];

for (let i = 0; i < 4; ++i) {
  noIds[i].addEventListener("change", (event) => {
    if (event.target.checked) {
      idCodeFields[i].parentElement.classList.add("is-hidden");
      idCodeFields[i].required = false;
      genders[i].parentElement.classList.remove("is-hidden");
      genders[i].required = true;
      bDays[i].parentElement.classList.remove("is-hidden");
      bDays[i].required = true;
    } else {
      idCodeFields[i].parentElement.classList.remove("is-hidden");
      idCodeFields[i].required = true;
      genders[i].parentElement.classList.add("is-hidden");
      genders[i].required = false;
      bDays[i].parentElement.classList.add("is-hidden");
      bDays[i].required = false;
    }
  });
}
