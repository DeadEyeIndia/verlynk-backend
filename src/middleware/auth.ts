import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import ErrorHandler from "../utils/errorHandling";
import { getMongoDb } from "../models/mongodb";
import { findUserById } from "../lib/data/user";
import catchAsyncError from "./catchAsyncError";
import { pick } from "../utils/constants";

export const isAuthenticatedUser = catchAsyncError(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { verlynk_token } = req.cookies as { verlynk_token: string };
    if (!verlynk_token) {
      return next(new ErrorHandler("Please login!", 401));
    }

    const decodeData = verify(
      verlynk_token,
      process.env.JWT_SECRET || "sdw5bsbf2sdawd"
    ) as { id: string; email: string };

    if (!decodeData.id || !decodeData.email) {
      return next(new ErrorHandler("Please login!", 403));
    }

    const db = await getMongoDb();
    const existingUser = await findUserById(db, decodeData.id);
    if (!existingUser) {
      return next(new ErrorHandler("User not found!", 403));
    }

    const user = pick(existingUser, "_id", "email");
    req.user = user;

    next();
  }
);
