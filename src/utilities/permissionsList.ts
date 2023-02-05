export const permissionsList = {
  reg: {
    view: {
      permissionName: "reg:view",
      basic: 1,
      contact: 2,
      full: 3,
    },
    edit: {
      permissionName: "reg:edit",
      basic: 1,
      full: 3,
      delete: 5,
    },
  },
  child: {},
};

const registrationPN = "registration";
const viewPN = ".view";
const editPN = ".edit";

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

export const tempPermissionsList = {
  registration: {
    PN: registrationPN,
    view: registrationView,
    edit: registrationEdit,
  },
};
