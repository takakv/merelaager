const data = {
  key: document.getElementById("auth-key").innerText,
};

const switchStatus = (target) => {
  const status = target.innerText;
  if (status === "Nop") target.innerText = "Ok";
  else target.innerText = "Nop";
};

document.addEventListener("click", (event) => {
  if (
    event.target["classList"].contains("prePayment") ||
    event.target["classList"].contains("fullPayment")
  ) {
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
