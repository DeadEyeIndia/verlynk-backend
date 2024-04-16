import { NextFunction, Request, Response } from "express";

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
