import { NextFunction, Request, Response } from "express";

import ErrorHandler from "../utils/errorHandling";

export default (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //   MongoDB Id error handling
  if (err.name === "CastError") {
    const message = `Resource not found`;
    err = new ErrorHandler(message, 400);
  }

  //   Duplication error handling
  // if (
  //   err.name === "MongoServerError" &&
  //   (err as any).code === 11000 &&
  //   (err as any).keyPattern.username
  // ) {
  //   const message = `Username is taken`;
  //   err = new ErrorHandler(message, 400);
  // }
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
    error: err.message,
  });
};
