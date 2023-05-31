class Constants {
  static SHIFT_ROLE_ROOT = "root";
  static SHIFT_ROLE_BOSS = "boss";
  static SHIFT_ROLE_INSTRUCTOR = "instructor";
  static SHIFT_ROLE_HELPER = "helper";

  static PERMISSION_REG_PF = "registration.";
  static PERMISSION_CAMPER_PF = "camper.";
  static PERMISSION_TEAM_PF = "team.";

  static PERMISSION_VIEW_PF = "view.";
  static PERMISSION_EDIT_PF = "edit.";
  static PERMISSION_DELETE = "delete";

  static PERMISSION_VIEW_REG_BASIC =
    this.PERMISSION_REG_PF + this.PERMISSION_VIEW_PF + "basic";
  static PERMISSION_VIEW_REG_CONTACT =
    this.PERMISSION_REG_PF + this.PERMISSION_VIEW_PF + "contact";
  // static PERMISSION_VIEW_REG_ADDRESS =
  //   this.PERMISSION_REG_PF + this.PERMISSION_VIEW_PF + "address";
  static PERMISSION_VIEW_REG_PRICE =
    this.PERMISSION_REG_PF + this.PERMISSION_VIEW_PF + "price";
  static PERMISSION_VIEW_REG_PI =
    this.PERMISSION_REG_PF + this.PERMISSION_VIEW_PF + "personal-info";
  // static PERMISSION_VIEW_REG_IDCODE =
  //   this.PERMISSION_REG_PF + this.PERMISSION_VIEW_PF + "idcode";
  static PERMISSION_VIEW_REG_FULL =
    this.PERMISSION_REG_PF + this.PERMISSION_VIEW_PF + "full";

  static PERMISSION_EDIT_REG_STATUS =
    this.PERMISSION_REG_PF + this.PERMISSION_EDIT_PF + "isRegistered";
  static PERMISSION_EDIT_REG_PRICE =
    this.PERMISSION_REG_PF + this.PERMISSION_EDIT_PF + "price";

  static PERMISSION_EDIT_CAMPER =
    this.PERMISSION_CAMPER_PF + this.PERMISSION_EDIT_PF + "basic";

  static PERMISSION_EDIT_TEAM =
    this.PERMISSION_TEAM_PF + this.PERMISSION_EDIT_PF + "basic";

  static PERMISSION_DELETE_REG =
    this.PERMISSION_REG_PF + this.PERMISSION_DELETE;
}

export default Constants;
