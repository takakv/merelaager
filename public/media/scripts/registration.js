// --- Imports
import { updatePrice } from "./registration/price.js";
import { validators } from "./registration/validation.js";
import { getSyncTime } from "./registration/clock.js";
import {
  addChild,
  priceAffectingFields,
  priceDisplay,
  regClosers,
  submitButton,
} from "./registration/htmlElements.js";
import {
  addCard,
  displayFirstCard,
  removeCard,
} from "./registration/cardLogic.js";

const regPrice = 100;

// --- Functions
export const hide = (element, isHidden) => {
  if (isHidden) element.classList.add("is-hidden");
  else element.classList.remove("is-hidden");
};

// --- Program
const pageAccessedByReload =
  (window.performance.navigation && window.performance.navigation.type === 1) ||
  window.performance
    .getEntriesByType("navigation")
    .map((nav) => nav.type)
    .includes("reload");

if (pageAccessedByReload) {
  document.getElementById("regform").reset();
}

displayFirstCard();
validators();

console.log("Registreerimisportaali diagnostika:");

const childCountEl = document.getElementById("childCount");
let childCount = childCountEl.value;

const preDisplay = document.getElementById("pre-total");
preDisplay.innerText = `${childCount * regPrice}`;

addChild.onclick = () => {
  addCard(childCount);
  ++childCount;
  childCountEl.value = childCount;

  preDisplay.innerText = `${childCount * regPrice}`;
  priceDisplay.innerText = `${parseInt(priceDisplay.innerText) + regPrice}`;
};

for (let i = 1; i < 4; ++i) {
  regClosers[i].onclick = () => {
    --childCount;
    childCountEl.value = childCount;
    removeCard(childCount);

    preDisplay.innerText = `${childCount * regPrice}`;
    priceDisplay.innerText = `${parseInt(priceDisplay.innerText) - regPrice}`;
    updatePrice(childCount);
  };
}

for (let i = 1; i < childCount; ++i) {
  addCard(i);
}

updatePrice(childCount);
priceDisplay.innerText = `${
  parseInt(priceDisplay.innerText) + childCount * regPrice
}`;

priceAffectingFields.forEach((fields) => {
  fields.forEach((field) => {
    field.onchange = () => {
      updatePrice(childCount);
    };
  });
});

const unlocker = async (moment) => {
  const unlockDate = new Date(Date.parse(moment));
  const ulTime = unlockDate.getTime();
  console.log(`Avaneb: ${unlockDate.toISOString()}`);
  const now = await getSyncTime();
  console.log(`Hetkel: ${new Date(now).toISOString()}`);

  if (now > ulTime) {
    submitButton.disabled = false;
    return true;
  }

  const eta = ulTime - now;
  console.log(`Sekundeid jäänud: ${eta}`);
  setTimeout(() => {
    submitButton.disabled = false;
  }, eta);

  return false;
};

if (window.location.hostname === "merelaager.ee") {
  unlocker("01 Jan 2023 12:00:00 UTC").then((res) =>
    console.log(`Avatud: ${res ? "jah" : "ei"}`)
  );
} else {
  unlocker("23 Dec 2021 12:35:00 UTC").then((res) =>
    console.log(`Avatud: ${res ? "jah" : "ei"}`)
  );
}

const mailhrefs = [...document.getElementsByClassName("obf-mail")];
mailhrefs.forEach((el) => {
  el.href = el.href.replace("ignoreme-", "");
});
/*const source = new EventSource("/registreerimine/events/");
const shiftSpots = [...document.getElementsByClassName("vahetuste-kohad")];
source.onmessage = (event) => {
  const parsedData = JSON.parse(event.data);
  for (let i = 0; i < 5; ++i) {
    const boysCount = parsedData[i + 1].M > 0 ? parsedData[i + 1].M : 0;
    const girlsCount = parsedData[i + 1].F > 0 ? parsedData[i + 1].F : 0;
    //shiftSpots[i].children[1].innerText = `Poisid: 20`;
    //shiftSpots[i].children[2].innerText = `Tüdrukud: 20`;
    shiftSpots[i].children[1].children[0].innerText = `Poisid: ${boysCount}`;
    shiftSpots[i].children[1].children[1].innerText = `Tüdrukud: ${girlsCount}`;
  }
};*/

const loadClock = async () => {
  const svClock = document.getElementById("serverClock");
  // const lcClock = document.getElementById("localClock");
  // lcClock.innerHTML = new Date().toLocaleTimeString();

  const locale = "et-EE";
  const tz = { timeZone: "Europe/Tallinn" };

  const syncTime = await getSyncTime();
  let current = new Date(syncTime);
  svClock.innerHTML = current.toLocaleTimeString(locale, tz);

  setInterval(() => {
    current.setUTCSeconds(current.getUTCSeconds() + 1);
    const tmp = current;
    svClock.innerHTML = current.toLocaleTimeString(locale, tz);
    // lcClock.innerHTML = new Date().toLocaleTimeString();
  }, 1000);

  return syncTime;
};

loadClock().then((time) => {
  console.log(`Server time: ${new Date(time).toISOString()}`);
  console.log(`Local time: ${new Date().toISOString()}`);
});

window.onunload = () => {};
