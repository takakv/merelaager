export class UserLogEntry {
  userId;
  module;
  action;
  success = false;
  reason: string = null;
  data: any = null;

  constructor(userId: number, module: string, action: string = null) {
    this.userId = userId;
    this.module = module;
    this.action = action;
  }

  setData = (data: any) => {
    this.data = data;
  };

  commit = (successState = true, message: string = null) => {
    this.success = successState;
    this.reason = message;
  };

  setAndCommit = (
    data: any,
    successState: boolean = true,
    message: string = null
  ) => {
    this.setData(data);
    this.commit(successState, message);
  };

  getObj = () => {
    return {
      userId: this.userId,
      module: this.module,
      action: this.action,
      success: this.success,
      reason: this.reason,
      data: this.data,
    };
  };
}
