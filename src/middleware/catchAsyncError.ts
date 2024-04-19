import { NextFunction, Request, Response } from "express";

/**
 * Middleware to handle asynchronous route handlers by catching any unhandled promise rejections.
 * @param {Function} theFunc - The asynchronous route handler function.
 * @returns {Function} A middleware function that wraps the asynchronous route handler function.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 */
export default (
    theFunc: (
      req: Request<any>,
      res: Response,
      next: NextFunction
    ) => Promise<any>
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };
