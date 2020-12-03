const displayNewSiteNotice = false;

if (displayNewSiteNotice) {
  const notice = document.getElementById("newsite-notice");
  const closeNotice = document.getElementById("newsite-notice-x");

  const displayNotice = localStorage.getItem("hasClosed");

  if (!displayNotice) {
    notice.classList.add("is-active");
  }

  closeNotice.onclick = () => {
    notice.classList.remove("is-active");
    localStorage.setItem("hasClosed", "true");
  };
}
