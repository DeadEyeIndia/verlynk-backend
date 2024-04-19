/**
 * Custom error handler class for managing errors with specific status codes.
 */

export default class ErrorHandler extends Error {
  /**
   *
   * @param {string} message - The error message.
   * @param {number} statusCode - This HTTP Status code associated with the errors.
   * @param {any} [error] - Additional error details or data.
   */
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
