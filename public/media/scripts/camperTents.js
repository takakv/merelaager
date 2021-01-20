document.addEventListener("change", (event) => {
  const data = {
    id: event.target.parentElement.id,
    tent: event.target.value,
  };
  fetch(`${window.location.href}update/tent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).catch((err) => alert(err));
});
