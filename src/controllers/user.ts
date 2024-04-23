import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import { getMongoClient } from "../models/mongodb";
import { IUser } from "../models/user";
import { IPost } from "../models/post";
import { IComment } from "../models/comment";
import { findUserByEmail, findUserById } from "../lib/data/user";
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandling";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import {
  COMMENT_COLLECTION,
  DB_NAME,
  pick,
  POST_COLLECTION,
  USER_COLLECTION,
} from "../utils/constants";

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
      (await client).close();
      return next(new ErrorHandler("User not found", 404));
    }

    (await client).close();

    const user = pick(existingUser, "_id", "email", "fullname", "createdAt");

    return res.status(200).json(user);
  }
);

/**
 * User controller edit user information based on the email address associated with the request user.
 * @param {Request<{}, {}, {email: string; fullname: string}>} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves once the operation is complete.
 */
export const editUser = catchAsyncError(
  async (
    req: Request<{}, {}, { email: string; fullname: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, fullname } = req.body;
    if (!email || !fullname || email === "" || fullname === "") {
      return next(new ErrorHandler("Missing Fields!", 406));
    }

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingUser = await findUserByEmail(db, req.user.email);
    if (!existingUser) {
      (await client).close();
      return next(new ErrorHandler("User not found", 404));
    }
    if (existingUser._id.toString() === req.user._id.toString()) {
      (await client).close();
      return next(new ErrorHandler("Not authorized", 401));
    }

    const updatedNow = new Date();
    const { acknowledged } = await db
      .collection<IUser>(USER_COLLECTION)
      .updateOne(
        { _id: existingUser._id },
        { $set: { email: email, fullname: fullname, updatedAt: updatedNow } }
      );
    (await client).close();
    if (!acknowledged) {
      return next(new ErrorHandler("Something went wrong", 400));
    }

    return res.status(201).json({
      success: acknowledged,
    });
  }
);

/**
 * User controller edit user password based on the email address associated with the request user.
 * @param {Request<{}, {}, {email: string; fullname: string}>} req - The request object.
 * @param {Response<{success: boolean}>} res - The response object with success.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves once the operation is complete.
 */
export const editUserPassword = catchAsyncError(
  async (
    req: Request<{}, {}, { password: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { password } = req.body;
    if (!password || password === "") {
      return next(new ErrorHandler("Missing Fields!", 406));
    }

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingUser = await findUserByEmail(db, req.user.email);
    if (!existingUser) {
      (await client).close();
      return next(new ErrorHandler("User not found", 404));
    }

    if (existingUser._id.toString() === req.user._id.toString()) {
      (await client).close();
      return next(new ErrorHandler("Not authorized", 401));
    }

    const isMatching = await comparePassword(password, existingUser.password);

    if (isMatching) {
      (await client).close();
      return next(new ErrorHandler("Try different password", 406));
    }

    const hashedPass = await hashPassword(password);
    const updatedNow = new Date();

    const { acknowledged } = await db
      .collection<IUser>(USER_COLLECTION)
      .updateOne(
        { _id: existingUser._id },
        { $set: { password: hashedPass, updatedAt: updatedNow } }
      );

    (await client).close();
    if (!acknowledged) {
      return next(
        new ErrorHandler("Password not changed, try again later", 400)
      );
    }

    res.status(201).json({
      success: acknowledged,
    });
  }
);

/**
 * User controller delete user information based on the user id associated with the request user.
 * @param {Request<{userid: string}>} req - The request object.
 * @param {Response<{userdeleted: boolean; commentAcknowledged: boolean; commentsDeleted: number; postAcknowledged: boolean; postsDeleted: boolean; postsDeleted: number}>} res - The response object containing user deleted, user comments deleted and user posts deleted.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves once the operation is complete.
 */
export const deleteUser = catchAsyncError(
  async (
    req: Request<{ userid: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { userid } = req.params;

    if (userid === undefined) {
      return next(new ErrorHandler("Please provide a userid", 406));
    }

    if (!ObjectId.isValid(userid)) {
      return next(new ErrorHandler("Not valid user Id", 406));
    }

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);
    const existingUser = await findUserById(db, userid);
    if (!existingUser) {
      (await client).close();
      return next(new ErrorHandler("User not found", 404));
    }

    const { acknowledged: postAcknowledged, deletedCount: postsDeleted } =
      await db
        .collection<IPost>(POST_COLLECTION)
        .deleteMany({ author: existingUser._id });
    const { acknowledged: commentAcknowledged, deletedCount: commentsDeleted } =
      await db
        .collection<IComment>(COMMENT_COLLECTION)
        .deleteMany({ user: existingUser._id });
    const { acknowledged } = await db
      .collection<IUser>(USER_COLLECTION)
      .deleteOne({ _id: existingUser._id });

    (await client).close();
    if (!postAcknowledged || !commentAcknowledged || !acknowledged) {
      return next(new ErrorHandler("User not completely deleted", 400));
    }

    res.status(201).json({
      userdeleted: acknowledged,
      commentAcknowledged: commentAcknowledged,
      commentsDeleted: commentsDeleted,
      postAcknowledged: postAcknowledged,
      postsDeleted: postsDeleted,
    });
  }
);
