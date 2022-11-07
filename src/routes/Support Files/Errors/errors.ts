import HttpError from "./HttpError";
import { StatusCodes } from "http-status-codes";

export class RegIdError extends HttpError {
  constructor(httpCode: number) {
    let message: string;

    switch (httpCode) {
      case StatusCodes.BAD_REQUEST:
        message = "Registration identifier malformed or missing";
        break;
      case StatusCodes.NOT_FOUND:
        message = "No registration found";
        break;
    }

    super(httpCode, message);
  }
}
