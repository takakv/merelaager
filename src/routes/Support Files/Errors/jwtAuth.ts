import { GenericError } from "./GenericError";

export class InvalidTokenError extends GenericError {
  constructor() {
    const errorCode = "InvalidAuthenticationToken";
    const message = "Access token is invalid or has expired";
    super(401, errorCode, message);
  }
}

export class MissingTokenError extends GenericError {
  constructor() {
    const errorCode = "MissingAuthenticationToken";
    const message = "Access token is missing or empty";
    super(401, errorCode, message);
  }
}
