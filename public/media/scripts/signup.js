const signupToken = window.location.pathname.split("/")[4];
const tokenField = document.getElementById("token");
tokenField.readOnly = true;
// tokenField.disabled = true;
tokenField.value = signupToken;

const userField = document.getElementById("username");

const url = `${window.location.protocol}//${window.location.hostname}${
  window.location.port ? ":" + window.location.port : window.location.port
}/api/su/chkusr/`;

userField.onblur = async () => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: userField.value }),
  });
  if (response.ok) {
    alert("Kasutajanimi on juba kasutuses");
  }
};
