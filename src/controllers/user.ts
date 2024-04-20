import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import { getMongoClient } from "../models/mongodb";
import { IUser } from "../models/user";
import { findUserByEmail } from "../lib/data/user";
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandling";
import { hashPassword } from "../utils/bcrypt";
import { DB_NAME, pick, USER_COLLECTION } from "../utils/constants";

/**
 * User controller function for creating a new user.
 * @param {Request<{}, {}, { fullname: string; email: string; password: string }>} req - The request object containing the user fields.
 * @param {Response} res - The response object sending message and success.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves once the operation is complete.
 */
export const userSignUp = catchAsyncError(
  async (
    req: Request<{}, {}, { fullname: string; email: string; password: string }>,
    res: Response<{ message: string; success: boolean }>,
    next: NextFunction
  ) => {
    const { fullname, email, password } = req.body;

    if (fullname === "" || email === "" || password === "") {
      return next(new ErrorHandler("Missing fields", 406));
    }

    const { client } = await getMongoClient();

    const db = (await client).db(DB_NAME);

    const hashedPassword = await hashPassword(password);
    const date = new Date();

    const { acknowledged, insertedId } = await db
      .collection<IUser>(USER_COLLECTION)
      .insertOne({
        _id: new ObjectId(),
        fullname: fullname,
        email: email,
        password: hashedPassword,
        createdAt: date,
        updatedAt: date,
      });

    if (!acknowledged || !insertedId) {
      (await client).close();
      return next(
        new ErrorHandler("Registration failed, Try again after sometime!", 409)
      );
    }

    (await client).close();

    res.status(201).json({
      message: "Registration success",
      success: acknowledged,
    });
  }
);

/**
 * User controller retrieves user information based on the email address associated with the request user.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves once the operation is complete.
 */
export const getUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingUser = await findUserByEmail(db, req.user.email);
    if (!existingUser) {
      return next(new ErrorHandler("User not found in getUser", 404));
    }

    (await client).close();

    const user = pick(existingUser, "_id", "email", "fullname", "createdAt");

    return res.status(200).json(user);
  }
);
