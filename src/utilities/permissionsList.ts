const registrationPN = "registration";
const viewPN = ".view";
const editPN = ".edit";
const deletePN = ".delete";

const registrationView = {
  PN: registrationPN + viewPN,
  basic: {
    PN: registrationPN + viewPN + ".basic",
  },
  contact: {
    PN: registrationPN + viewPN + ".contact",
  },
  price: {
    PN: registrationPN + viewPN + ".price",
  },
  address: {
    PN: registrationPN + viewPN + ".address",
  },
  idCode: {
    PN: registrationPN + viewPN + ".idCode",
  },
};

const registrationEdit = {
  PN: registrationPN + editPN,
  isRegistered: {
    PN: registrationPN + editPN + ".isRegistered",
  },
  isOld: {
    PN: registrationPN + editPN + ".isOld",
  },
  price: {
    PN: registrationPN + editPN + ".price",
    paid: {
      PN: registrationPN + editPN + ".price.paid",
    },
    toPay: {
      PN: registrationPN + editPN + ".price.toPay",
    },
  },
};

const registrationDelete = {
  PN: registrationPN + deletePN,
};

export const tempPermissionsList = {
  registration: {
    PN: registrationPN,
    view: registrationView,
    edit: registrationEdit,
    delete: registrationDelete,
  },
};
