import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandling";
import { getMongoDb } from "../models/mongodb";
import { IUser } from "../models/user";
import { findUserByEmail } from "../lib/data/user";
import { pick, USER_COLLECTION } from "../utils/constants";
import { hashPassword } from "../utils/bcrypt";

export const userSignUp = catchAsyncError(
  async (
    req: Request<{}, {}, { fullname: string; email: string; password: string }>,
    res: Response<{ message: string; success: boolean }>,
    next: NextFunction
  ) => {
    const { fullname, email, password } = req.body;

    if (fullname === "" || email === "" || password === "")
      return next(new ErrorHandler("Missing fields", 406));

    const db = await getMongoDb();

    const hashedPassword = await hashPassword(password);
    const date = new Date();

    const newUser = await db.collection<IUser>(USER_COLLECTION).insertOne({
      _id: new ObjectId(),
      fullname: fullname,
      email: email,
      password: hashedPassword,
      createdAt: date,
      updatedAt: date,
    });

    if (!newUser.acknowledged || !newUser.insertedId) {
      return next(
        new ErrorHandler("Registration failed, Try again after sometime!", 409)
      );
    }

    res.status(201).json({
      message: "Registration success",
      success: true,
    });
  }
);

export const getUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const db = await getMongoDb();
    const existingUser = await findUserByEmail(db, req.user.email);

    if (!existingUser) {
      return next(new ErrorHandler("User not found", 404));
    }

    const user = pick(existingUser, "_id", "email", "fullname", "createdAt");

    res.status(200).json(user);
  }
);
