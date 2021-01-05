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
    console.log(data.id);
    fetch(`${window.location.href}update/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).catch((err) => console.log(err));
  }
});
