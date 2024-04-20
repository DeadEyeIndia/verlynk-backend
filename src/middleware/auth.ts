import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { getMongoClient } from "../models/mongodb";
import { findUserById } from "../lib/data/user";
import catchAsyncError from "./catchAsyncError";
import ErrorHandler from "../utils/errorHandling";
import { DB_NAME, pick } from "../utils/constants";

/**
 * Middleware to authenticate the user by verifying the presence and validity of a JWT token.
 * @param {Request} req - The request object.
 * @param {Response} _res - The response object (unused).
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} - Promise resolving to void.
 */

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

    // console.log({ decodeData });

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingUser = await findUserById(db, decodeData.id);
    // console.log(existingUser);
    if (!existingUser) {
      return next(new ErrorHandler("User not found in auth!", 403));
    }

    const user = pick(existingUser, "_id", "email");
    req.user = user;

    (await client).close();

    next();
  }
);
