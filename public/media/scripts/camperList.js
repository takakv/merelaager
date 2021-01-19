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

const v1Head = document.getElementById("1v-head");
const v2Head = document.getElementById("2v-head");
const v3Head = document.getElementById("3v-head");
const v4Head = document.getElementById("4v-head");

const v1Switch = document.getElementById("1v-switch");
const v2Switch = document.getElementById("2v-switch");
const v3Switch = document.getElementById("3v-switch");
const v4Switch = document.getElementById("4v-switch");

const hide = (element, isHidden) => {
  if (isHidden) element.classList.add("is-hidden");
  else element.classList.remove("is-hidden");
};

if (v1Table) {
  hide(v2Table, true);
  hide(v3Table, true);
  hide(v4Table, true);
  hide(v2Head, true);
  hide(v3Head, true);
  hide(v4Head, true);
}

if (v1Switch) {
  v1Switch.onclick = () => {
    hide(v1Table, false);
    hide(v2Table, true);
    hide(v3Table, true);
    hide(v4Table, true);
    hide(v1Head, false);
    hide(v2Head, true);
    hide(v3Head, true);
    hide(v4Head, true);
  };

  v2Switch.onclick = () => {
    hide(v1Table, true);
    hide(v2Table, false);
    hide(v3Table, true);
    hide(v4Table, true);
    hide(v1Head, true);
    hide(v2Head, false);
    hide(v3Head, true);
    hide(v4Head, true);
  };

  v3Switch.onclick = () => {
    hide(v1Table, true);
    hide(v2Table, true);
    hide(v3Table, false);
    hide(v4Table, true);
    hide(v1Head, true);
    hide(v2Head, true);
    hide(v3Head, false);
    hide(v4Head, true);
  };

  v4Switch.onclick = () => {
    hide(v1Table, true);
    hide(v2Table, true);
    hide(v3Table, true);
    hide(v4Table, false);
    hide(v1Head, true);
    hide(v2Head, true);
    hide(v3Head, true);
    hide(v4Head, false);
  };
}
