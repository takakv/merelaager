const newSiteNotice = document.getElementById("newsite-notice");
const closeNewSiteNotice = document.getElementById("newsite-notice-x");

const displayNewSiteNotice = localStorage.getItem("hasClosed");

if (!displayNewSiteNotice) {
  newSiteNotice.classList.add("is-active");
}

closeNewSiteNotice.onclick = () => {
  newSiteNotice.classList.remove("is-active");
  localStorage.setItem("hasClosed", "true");
};
