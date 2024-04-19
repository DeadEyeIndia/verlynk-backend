import { NextFunction, Request, Response } from "express";

import { getMongoClient } from "../models/mongodb";
import { findUserByEmail } from "../lib/data/user";
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandling";
import { comparePassword } from "../utils/bcrypt";
import { sendToken } from "../utils/jwt";
import { DB_NAME } from "../utils/constants";

/**
 * Authentication controller function for user sign-in functionality.
 * @param {Request<{}, {}, { email: string; password: string }>} req - The request object.
 * @param {Response} res - The response object sending jsonwebtoken to client.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} Promise representing the asynchronous operation.
 */
export const userSignIn = catchAsyncError(
  async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;
    if (email === "" || password === "") {
      return next(new ErrorHandler("Missing Fields!", 406));
    }

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingUser = await findUserByEmail(db, email);
    if (!existingUser) {
      return next(new ErrorHandler("Invalid credentials!", 401));
    }

    const isMatchingPassword = await comparePassword(
      password,
      existingUser.password
    );
    if (!isMatchingPassword) {
      return next(new ErrorHandler("Invalid credentials!", 401));
    }

    (await client).close();

    sendToken(existingUser, 200, res);
  }
);

/**
 * Authentication controller function for user sign-out functionality.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object indicating successful sign-out.
 * @param {NextFunction} _next - The next function to be called in the middleware stack.
 * @returns {Promise<Response>} A Promise resolving to the response indicating successful sign-out.
 */
export const userSignOut = catchAsyncError(
  async (
    _req: Request,
    res: Response<{ success: boolean; message: string }>,
    _next: NextFunction
  ) => {
    res.cookie("verlynk_token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      priority: "high",
    });

    res.status(200).json({
      success: true,
      message: "Logged out",
    });
  }
);
