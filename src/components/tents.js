import suspend from "./Shared/suspend";

const getTentInfo = () =>
  fetch(`${window.location.href}api/tents/`).then((response) =>
    response.json()
  );

export default suspend(getTentInfo());
