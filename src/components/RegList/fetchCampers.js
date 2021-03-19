import suspend from "../Shared/suspend";

const getCamperList = () =>
  fetch(`${window.location.href}api/reglist/`).then((response) =>
    response.json()
  );

export default suspend(getCamperList());
