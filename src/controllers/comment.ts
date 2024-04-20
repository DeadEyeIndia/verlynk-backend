import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandling";
import { getMongoClient } from "../models/mongodb";
import { IComment } from "../models/comment";
import { findPostById } from "../lib/data/post";
import {
  findCommentByCommentId,
  findCommentByPostId,
} from "../lib/data/comment";
import { COMMENT_COLLECTION, DB_NAME } from "../utils/constants";

/**
 * Comment controller function for adding comment on post.
 * @param {Request} req - The request object containing the post ID parameter and the commenttext field.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves after handling the deleting post operation.
 */
export const newComment = catchAsyncError(
  async (
    req: Request<{ postid: string }, {}, { commenttext: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { postid } = req.params;
    const { commenttext } = req.body;
    if (postid === undefined || !ObjectId.isValid(postid)) {
      return next(new ErrorHandler("Resource not found", 404));
    }
    if (commenttext === undefined || commenttext === "") {
      return next(new ErrorHandler("Comment text is required", 406));
    }
    if (commenttext.length < 4) {
      return next(new ErrorHandler("Not enough text to post", 406));
    }

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingPost = await findPostById(db, postid);
    if (!existingPost || existingPost.length < 1) {
      (await client).close();
      return next(new ErrorHandler("Resource not found", 404));
    }

    const now = new Date();
    const { acknowledged, insertedId } = await db
      .collection<IComment>(COMMENT_COLLECTION)
      .insertOne({
        _id: new ObjectId(),
        commenttext: commenttext.trim(),
        user: req.user._id,
        post: existingPost[0]._id,
        createdAt: now,
        updatedAt: now,
      });

    if (!acknowledged || !insertedId) {
      (await client).close();
      return next(
        new ErrorHandler("Comment not post, try again after sometime", 400)
      );
    }

    (await client).close();
    res.status(201).json({
      success: acknowledged,
    });
  }
);

export const getPostComments = catchAsyncError(
  async (
    req: Request<{ postid: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { postid } = req.params;
    if (postid === undefined || !ObjectId.isValid(postid)) {
      return next(new ErrorHandler("Resource not found", 404));
    }

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingPost = await findPostById(db, postid);
    if (!existingPost || existingPost.length < 1) {
      (await client).close();
      return next(new ErrorHandler("Resource not found", 404));
    }

    const existingComments = await findCommentByPostId(
      db,
      existingPost[0]._id.toString()
    );

    (await client).close();
    res.status(200).json({
      existingComments,
    });
  }
);

export const deleteComment = catchAsyncError(
  async (
    req: Request<{ postid: string; commentid: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { postid, commentid } = req.params;
    if (
      postid === undefined ||
      !ObjectId.isValid(postid) ||
      commentid === undefined ||
      !ObjectId.isValid(commentid)
    ) {
      return next(new ErrorHandler("Resource not found", 404));
    }

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingPost = await findPostById(db, postid);
    if (!existingPost || existingPost.length < 1) {
      (await client).close();
      return next(new ErrorHandler("Resource not found", 404));
    }

    const existingComment = await findCommentByCommentId(db, commentid);

    if (!existingComment) {
      (await client).close();
      return next(new ErrorHandler("Comment does not exist", 404));
    }

    if (existingComment.user.toString() !== req.user._id.toString()) {
      (await client).close();
      return next(new ErrorHandler("You can not delete this comment", 401));
    }

    const { acknowledged } = await db
      .collection<IComment>(COMMENT_COLLECTION)
      .deleteOne({ _id: existingComment._id });

    (await client).close();
    res.status(201).json({
      success: acknowledged,
    });
  }
);
