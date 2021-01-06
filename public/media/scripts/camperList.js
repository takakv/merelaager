const data = {
  key: document.getElementById("auth-key").innerText,
};

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
