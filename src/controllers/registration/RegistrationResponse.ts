class RegistrationResponse {
  protected statusCode: number;

  constructor(code) {
    this.statusCode = code;
  }
}

export class RegistrationSuccessResponse extends RegistrationResponse {
  constructor() {
    super(201);
  }
}

export class RegistrationErrorResponse extends RegistrationResponse {
  private readonly timestamp: string;
  private readonly error_message: string;

  constructor(code, message) {
    super(code);
    this.error_message = message;
    this.timestamp = new Date().toISOString();
  }

  toJson(): object {
    return {
      error_code: this.statusCode,
      error_message: this.error_message,
      timestamp: this.timestamp,
    };
  }
}
