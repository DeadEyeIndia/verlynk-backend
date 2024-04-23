import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandling";
import { getMongoClient } from "../models/mongodb";
import { findPostById, findPostByQueryParams } from "../lib/data/post";
import { getUploadPostofFile } from "../utils/post-upload";
import { IPost } from "../models/post";
import { IComment } from "../models/comment";
import {
  COMMENT_COLLECTION,
  DB_NAME,
  POST_COLLECTION,
} from "../utils/constants";

/**
 * Controller function for creating a new post.
 * @param {Request<{}, {}, {title: string; intro: string; quickintrotitle: string; quickintrolist: string; resulttitle: string; resultlist: string; conclusion: string;}>} req - The request object containing the required field to create new post.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves once the operation is complete.
 */
export const newPost = catchAsyncError(
  async (
    req: Request<
      {},
      {},
      {
        title: string;
        intro: string;
        quickintrotitle: string;
        quickintrolist: string;
        resulttitle: string;
        resultlist: string;
        conclusion: string;
      }
    >,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.file) {
      return next(new ErrorHandler("Please upload a image", 406));
    }

    const {
      title,
      intro,
      conclusion,
      quickintrolist,
      quickintrotitle,
      resultlist,
      resulttitle,
    } = req.body;

    if (
      title === undefined ||
      title === "" ||
      intro === undefined ||
      conclusion === undefined ||
      quickintrolist === undefined ||
      resultlist === undefined ||
      quickintrotitle === undefined ||
      quickintrotitle === "" ||
      resulttitle === undefined ||
      resulttitle === ""
    ) {
      return next(new ErrorHandler("Missing Fields", 406));
    }

    const regex: RegExp = /\s*,+\s*/;

    const introArr: string[] = intro.split(regex);
    const conclusionArr: string[] = conclusion.split(regex);
    const quicklistArr: string[] = quickintrolist.split(regex);
    const resultListArr: string[] = resultlist.split(regex);

    if (
      introArr.length < 1 ||
      conclusionArr.length < 1 ||
      quicklistArr.length < 1 ||
      resultListArr.length < 1
    ) {
      return next(new ErrorHandler("Missing Fields", 406));
    }

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const { id, filename } = await getUploadPostofFile(req, req.file);
    if (!id || !filename) {
      (await client).close();
      return next(
        new ErrorHandler(
          "Upload incomplete, try again with different image",
          400
        )
      );
    }

    const now = new Date();

    const { acknowledged, insertedId } = await db
      .collection<IPost>(POST_COLLECTION)
      .insertOne({
        _id: new ObjectId(),
        title: title.trim(),
        postimage: {
          id: id,
          filename: filename,
        },
        intro: [...introArr],
        quickintro: {
          title: quickintrotitle.trim(),
          lists: [...quicklistArr],
        },
        result: {
          title: resulttitle.trim(),
          lists: [...resultListArr],
        },
        conclusion: [...conclusionArr],
        author: new ObjectId(req.user._id),
        createdAt: now,
        updatedAt: now,
      });

    if (!acknowledged || !insertedId) {
      (await client).close();
      return next(
        new ErrorHandler("Upload incomplete, try again afer sometime", 400)
      );
    }

    (await client).close();
    res.status(201).json({ success: acknowledged });
  }
);

/**
 * Post controller function for get a posts using query params.
 * @param {Request} req - The request object containing the posts with query parameters and the fields to update.
 * @param {Response} res - The response object sending client a success and modifiedcount.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves after handling the get post operation.
 */
export const getPosts = catchAsyncError(
  async (req: Request<{}, {}, {}>, res: Response, next: NextFunction) => {
    const query = req.query as { page: string };
    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const posts = await findPostByQueryParams(db, query);

    if (!posts) {
      (await client).close();
      return res.status(200).json({ success: true, posts: [] });
    }

    (await client).close();
    return res.status(200).json({
      success: true,
      posts: {
        totalPosts: posts.totalPosts,
        currentFetchedPosts: posts.posts.length,
        posts: posts.posts,
      },
    });
  }
);

/**
 * Post controller function for get a post using params postid.
 * @param {Request} req - The request object containing the post ID parameter and the fields to update.
 * @param {Response} res - The response object sending client a success and modifiedcount.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves after handling the get post operation.
 */
export const getPost = catchAsyncError(
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
    if (!existingPost || existingPost.length === 0) {
      (await client).close();
      return next(new ErrorHandler("Resource not found", 404));
    }

    (await client).close();
    res.status(200).json(existingPost[0]);
  }
);

/**
 * Post controller function for editing a post.
 * @param {Request} req - The request object containing the post ID parameter and the fields to update.
 * @param {Response} res - The response object sending client a success and modifiedcount.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves after handling the edit post operation.
 */
export const editPost = catchAsyncError(
  async (
    req: Request<
      {
        postid: string;
      },
      {},
      {
        title: string;
        intro: string;
        quickintrotitle: string;
        quickintrolist: string;
        resulttitle: string;
        resultlist: string;
        conclusion: string;
      }
    >,
    res: Response,
    next: NextFunction
  ) => {
    const { postid } = req.params;
    const {
      conclusion,
      intro,
      quickintrolist,
      quickintrotitle,
      resultlist,
      resulttitle,
      title,
    } = req.body;

    if (postid === undefined || !ObjectId.isValid(postid)) {
      return next(new ErrorHandler("Resource not found", 406));
    }

    if (
      title === undefined ||
      title === "" ||
      intro === undefined ||
      conclusion === undefined ||
      quickintrolist === undefined ||
      resultlist === undefined ||
      quickintrotitle === undefined ||
      quickintrotitle === "" ||
      resulttitle === undefined ||
      resulttitle === ""
    ) {
      return next(new ErrorHandler("Missing fields", 406));
    }

    const regex: RegExp = /\s*,+\s*/;

    const introArr: string[] = intro.split(regex);
    const conclusionArr: string[] = conclusion.split(regex);
    const quicklistArr: string[] = quickintrolist.split(regex);
    const resultListArr: string[] = resultlist.split(regex);

    if (
      introArr.length < 1 ||
      conclusionArr.length < 1 ||
      quicklistArr.length < 1 ||
      resultListArr.length < 1
    ) {
      return next(new ErrorHandler("Missing Fields", 406));
    }

    const { client } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingPost = await findPostById(db, postid);
    if (!existingPost || existingPost.length === 0) {
      (await client).close();
      return next(new ErrorHandler("Resource not found", 404));
    }
    if (req.user._id.toString() !== existingPost[0].author._id.toString()) {
      (await client).close();
      return next(new ErrorHandler("Not authorized!", 400));
    }

    const { acknowledged } = await db
      .collection<IPost>(POST_COLLECTION)
      .updateOne(
        { _id: existingPost[0]._id },
        {
          $set: {
            title: title,
            intro: [...introArr],
            quickintro: { title: quickintrotitle, lists: [...quicklistArr] },
            result: { title: resulttitle, lists: [...resultListArr] },
            conclusion: [...conclusionArr],
            updatedAt: new Date(),
          },
        }
      );

    if (!acknowledged) {
      (await client).close();
      return next(new ErrorHandler("Update not successful", 400));
    }

    (await client).close();
    res.status(201).json({ success: acknowledged });
  }
);

/**
 * Post controller function for editing a post image.
 * @param {Request} req - The request object containing the post ID parameter and the fields to update.
 * @param {Response} res - The response object sending client a success and modifiedcount.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves after handling the edit post operation.
 */
export const editPostImage = catchAsyncError(
  async (
    req: Request<{ postid: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { postid } = req.params;

    if (postid === undefined || !ObjectId.isValid(postid)) {
      return next(new ErrorHandler("Resource not found", 404));
    }

    if (!req.file) {
      return next(new ErrorHandler("Please upload a image", 406));
    }

    const { client, bucket } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingPost = await findPostById(db, postid);
    if (!existingPost || existingPost.length === 0) {
      (await client).close();
      return next(new ErrorHandler("Resource not found", 404));
    }
    if (req.user._id.toString() !== existingPost[0].author._id.toString()) {
      (await client).close();

      return next(new ErrorHandler("Not authorized!", 400));
    }

    await bucket.delete(existingPost[0].postimage.id);

    const { id, filename } = await getUploadPostofFile(req, req.file);

    if (!id || !filename) {
      (await client).close();
      return next(
        new ErrorHandler(
          "Upload incomplete, try again with different image",
          400
        )
      );
    }

    const { acknowledged } = await db
      .collection<IPost>(POST_COLLECTION)
      .updateOne(
        { _id: existingPost[0]._id },
        {
          $set: {
            postimage: {
              id: id,
              filename: filename,
            },
            updatedAt: new Date(),
          },
        }
      );

    if (!acknowledged) {
      (await client).close();
      return next(new ErrorHandler("Update not successful", 400));
    }

    (await client).close();

    res.status(201).json({
      success: acknowledged,
    });
  }
);

/**
 * Post controller function for deleting a post image.
 * @param {Request} req - The request object containing the post ID parameter and the fields to update.
 * @param {Response} res - The response object sending client a success and modifiedcount.
 * @param {NextFunction} next - The next function to be called in the middleware stack.
 * @returns {Promise<void>} A promise that resolves after handling the deleting post operation.
 */
export const deletePost = catchAsyncError(
  async (
    req: Request<{ postid: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { postid } = req.params;

    if (postid === undefined || !ObjectId.isValid(postid)) {
      return next(new ErrorHandler("Resource not found", 404));
    }

    const { client, bucket } = await getMongoClient();
    const db = (await client).db(DB_NAME);

    const existingPost = await findPostById(db, postid);
    if (!existingPost || existingPost.length === 0) {
      (await client).close();
      return next(new ErrorHandler("Resource not found", 404));
    }

    if (req.user._id.toString() !== existingPost[0].author._id.toString()) {
      (await client).close();
      return next(new ErrorHandler("Not authorized", 401));
    }

    if (existingPost[0].postimage.id) {
      await bucket.delete(existingPost[0].postimage.id);
    }

    const {
      acknowledged: commentAcknowledged,
      deletedCount: commentDeletedCount,
    } = await db
      .collection<IComment>(COMMENT_COLLECTION)
      .deleteMany({ post: existingPost[0]._id });

    const { acknowledged, deletedCount } = await db
      .collection<IPost>(POST_COLLECTION)
      .deleteOne({ _id: existingPost[0]._id });

    (await client).close();
    // console.log(
    //   { acknowledged },
    //   { deletedCount },
    //   { commentAcknowledged },
    //   { commentDeletedCount }
    // );

    res.status(201).json({ success: acknowledged || commentAcknowledged });
  }
);
