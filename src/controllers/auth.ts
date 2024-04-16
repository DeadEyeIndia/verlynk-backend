import { NextFunction, Request, Response } from "express";

import { getMongoDb } from "../models/mongodb";
import { findUserByEmail } from "../lib/data/user";
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandling";
import { comparePassword } from "../utils/bcrypt";
import { sendToken } from "../utils/jwt";

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

    const db = await getMongoDb();

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

    sendToken(existingUser, 200, res);
  }
);

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

    return res.status(200).json({
      success: true,
      message: "Logged out",
    });
  }
);
