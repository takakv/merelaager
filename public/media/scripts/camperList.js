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
  } else if (event.target["classList"].contains("updatePrice")) {
    data.id = event.target["previousElementSibling"].id;
    data.value = event.target["previousElementSibling"].value;
    fetch(`${window.location.href}update/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.status === 200) {
          event.target["classList"].add("ok");
          setTimeout(() => {
            event.target["classList"].remove("ok");
          }, 3000);
        } else {
          event.target["classList"].add("nop");
          setTimeout(() => {
            event.target["classList"].remove("nop");
          }, 3000);
        }
      })
      .catch((err) => {
        console.log(err);
        event.target["classList"].add("nop");
        setTimeout(() => {
          event.target["classList"].remove("nop");
        }, 3000);
      });
  }
});
