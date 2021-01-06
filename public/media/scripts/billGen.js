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
    .then(async (response) => ({
      filename: "arve.pdf",
      blob: await response.blob(),
    }))
    .then((obj) => {
      // const data = window.URL.createObjectURL(blob);
      // window.location.assign(data);
      // window.open(data);
      const newBlob = new Blob([obj.blob], { type: "application/pdf" });
      const objUrl = window.URL.createObjectURL(newBlob);
      // window.location.assign(objUrl);
      const link = document.createElement("a");
      link.href = objUrl;
      link.download = obj.filename;
      link.click();
    });
};

fetcher.onclick = () => {
  fetchPDF("fetch");
};

generator.onclick = () => {
  fetchPDF("generate");
};
