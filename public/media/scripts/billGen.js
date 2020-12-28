const fetcher = document.getElementById("fetch");
const generator = document.getElementById("gen");

const fetchPDF = (target) => {
  const data = { meil: document.getElementById("mail").value };
  fetch(`${window.location}${target}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.blob())
    .then((blob) => {
      const data = window.URL.createObjectURL(blob);
      window.location.assign(data);
    });
};

fetcher.onclick = () => {
  fetchPDF("fetch");
};

generator.onclick = () => {
  fetchPDF("generate");
};
