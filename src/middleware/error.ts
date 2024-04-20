import { NextFunction, Request, Response } from "express";

import ErrorHandler from "../utils/errorHandling";

/**
 * Express middleware for handling custom errors and sending appropriate responses.
 * @param {ErrorHandler} err - The error object.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 */
export default (
  err: ErrorHandler,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (
    err.name === "MongoServerError" &&
    (err as any).code === 11000 &&
    (err as any).keyPattern.email
  ) {
    const message = `Email already exists`;
    err = new ErrorHandler(message, 400);
  }

  //   for JWT error handling
  if (err.name === "JsonWebTokenError" && err.message === "jwt malformed") {
    const message = "Json Web Token is invalid, Please Login.";
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired, Try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    err: err,
  });
};
