import suspend from "../Shared/suspend";

const getTentList = () =>
  fetch(`${window.location.href}api/tents/`).then((response) =>
    response.json()
  );

export default suspend(getTentList());
