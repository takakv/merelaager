const updateTent = (id, tent) => {
  const data = {
    id: id,
    tent: tent,
  };
  fetch(`${window.location.href}update/tent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).catch((err) => alert(err));
};

document.addEventListener("change", (event) => {
  updateTent(event.target.parentElement.id, event.target.value);
});

document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("c-tent-child__rm")) return;
  let id = event.target.parentElement.id;
  id = id.split("-")[0];
  updateTent(id, null);
});
