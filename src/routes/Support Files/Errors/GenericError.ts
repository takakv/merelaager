export class GenericError {
  private httpCode: number;
  private readonly code: string;
  private readonly message: string;
  private readonly date: string;

  constructor(httpCode: number, code: string, message: string) {
    this.httpCode = httpCode;
    this.code = code;
    this.message = message;
    this.date = new Date().toISOString();
  }

  getJson() {
    return {
      error: {
        code: this.code,
        message: this.message,
        date: this.date,
      },
    };
  }
}
