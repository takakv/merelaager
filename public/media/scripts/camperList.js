const data = {};

const switchStatus = (target) => {
  const status = target.innerText;
  if (status === "ei") {
    target.innerText = "jah";
    target.classList.remove("ei");
    target.classList.add("jah");
  } else {
    target.innerText = "ei";
    target.classList.remove("jah");
    target.classList.add("ei");
  }
};

document.addEventListener("click", (event) => {
  if (event.target["classList"].contains("clicker")) {
    switchStatus(event.target);
    data.id = event.target.id;
    fetch(`${window.location.href}update/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).catch((err) => alert(err));
  }
});

const paid = [...document.getElementsByClassName("price")];
const toPay = [...document.getElementsByClassName("priceToPay")];

paid.forEach((field) => {
  field.onblur = async () => {
    data.id = field.id;
    data.value = field.value;
    try {
      const response = await fetch(`${window.location.href}update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        field.classList.add("ok");
        setTimeout(() => {
          field.classList.remove("ok");
        }, 3000);
      } else {
        field.classList.add("nop");
        setTimeout(() => {
          field.classList.remove("nop");
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      alert("Midagi läks nihu. Palun anna Taanielile teada :)");
    }
  };
});

toPay.forEach((field) => {
  field.onblur = async () => {
    data.id = field.id;
    data.value = field.value;
    try {
      const response = await fetch(`${window.location.href}update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        field.classList.add("ok");
        setTimeout(() => {
          field.classList.remove("ok");
        }, 3000);
      } else {
        field.classList.add("nop");
        setTimeout(() => {
          field.classList.remove("nop");
        }, 3000);
      }
    } catch (err) {
      console.log(err);
      alert("Midagi läks nihu. Palun anna Taanielile teada :)");
    }
  };
});

const v1Table = document.getElementById("1v-table");
const v2Table = document.getElementById("2v-table");
const v3Table = document.getElementById("3v-table");
const v4Table = document.getElementById("4v-table");

const shiftTables = [v1Table, v2Table, v3Table, v4Table];

const v1Head = document.getElementById("1v-head");
const v2Head = document.getElementById("2v-head");
const v3Head = document.getElementById("3v-head");
const v4Head = document.getElementById("4v-head");

const shiftHeads = [v1Head, v2Head, v3Head, v4Head];

const v1Switch = document.getElementById("1v-switch");
const v2Switch = document.getElementById("2v-switch");
const v3Switch = document.getElementById("3v-switch");
const v4Switch = document.getElementById("4v-switch");

const hide = (element, isHidden) => {
  if (isHidden) element.classList.add("is-hidden");
  else element.classList.remove("is-hidden");
};

const toggleShift = (shift) => {
  for (let i = 0; i < 4; ++i) {
    hide(shiftTables[i], true);
    hide(shiftHeads[i], true);
  }
  hide(shiftTables[shift - 1], false);
  hide(shiftHeads[shift - 1], false);
};

if (v1Table) {
  toggleShift(1);
  v1Switch.onclick = () => toggleShift(1);
  v2Switch.onclick = () => toggleShift(2);
  v3Switch.onclick = () => toggleShift(3);
  v4Switch.onclick = () => toggleShift(4);
}
