import { NextFunction, Request, Response } from "express";

import { getMongoClient } from "../models/mongodb";
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandling";

export const getPostImage = catchAsyncError(
  async (
    req: Request<{ filename: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { filename } = req.params;

    if (!filename || filename === "") {
      return next(new ErrorHandler("Image not found", 404));
    }

    const { bucket } = await getMongoClient();

    const downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.pipe(res);
  }
);
