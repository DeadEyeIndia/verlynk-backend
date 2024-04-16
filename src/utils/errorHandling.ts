export default class ErrorHandler extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public error?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;

    Error.captureStackTrace(this, this.constructor);
  }
}
