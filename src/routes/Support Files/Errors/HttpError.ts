class HttpError {
  public readonly httpCode: number;
  public readonly ok: boolean;
  private readonly message: string | null;
  private readonly date: string;

  constructor(httpCode: number, message: string = null) {
    this.httpCode = httpCode;
    this.message = message;
    this.date = new Date().toISOString();
  }

  json() {
    return {
      error: {
        statusCode: this.httpCode,
        message: this.message,
        date: this.date,
      },
    };
  }
}

export default HttpError;
