const resetToken = window.location.pathname.split("/")[4];
const tokenField = document.getElementById("token");
tokenField.readOnly = true;
// tokenField.disabled = true;
tokenField.value = resetToken;

const pwdField = document.getElementById("password");
const reField = document.getElementById("re-password");
const submit = document.getElementById("submit");
const msg = document.getElementById("msg");

const notifyDiff = () => {
  msg.innerText = "Salasõnad ei ühti";
};

const comparator = () => {
  if (pwdField.value !== reField.value) {
    submit.disabled = true;
    submit.addEventListener("mouseenter", notifyDiff);
    submit.addEventListener("mouseleave", () => {
      msg.innerText = "";
    });
  } else {
    submit.removeEventListener("mouseenter", notifyDiff);
    msg.innerText = "";
    submit.disabled = false;
  }
};

const listeners = ["change", "keyup", "paste"];

listeners.forEach((listener) =>
  pwdField.addEventListener(listener, comparator)
);
listeners.forEach((listener) => reField.addEventListener(listener, comparator));
