import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";

import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandling";
import { getMongoClient } from "../models/mongodb";
import { IPost } from "../models/post";
import { DB_NAME, POST_COLLECTION, USER_COLLECTION } from "../utils/constants";
import { getUploadPostofFile } from "../utils/post-upload";
import { findPostById } from "../lib/data/post";

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

    const uploadId = await getUploadPostofFile(req, req.file);

    if (!uploadId.id || !uploadId.filename) {
      (await client).close();
      return next(
        new ErrorHandler(
          "Upload incomplete, try again with different image",
          400
        )
      );
    }

    const newPost = await db.collection<IPost>(POST_COLLECTION).insertOne({
      _id: new ObjectId(),
      title: title.trim(),
      postimage: {
        id: uploadId.id,
        filename: uploadId.filename,
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
    });

    if (!newPost.acknowledged || !newPost.insertedId) {
      (await client).close();
      return next(
        new ErrorHandler("Upload incomplete, try again afer sometime", 400)
      );
    }

    (await client).close();

    res.status(201).json({ success: true });
  }
);

/**
 * Post controller function for editing a post.
 * @param {Request<{postid: string}, {}, {title: string; intro: string; quickintrotitle: string; quickintrolist: string; resulttitle: string; resultlist: string; conclusion: string;}>} req - The request object containing the post ID parameter and the fields to update.
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

    if (postid === undefined) {
      return next(new ErrorHandler("PostId missing", 406));
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

    const existingPost = await findPostById(db, postid);

    if (!existingPost) {
      (await client).close();
      return next(new ErrorHandler("Resource not found", 404));
    }

    const { acknowledged, modifiedCount } = await db
      .collection<IPost>(POST_COLLECTION)
      .updateOne(
        { _id: existingPost._id },
        {
          $set: {
            title: title,
            intro: [...introArr],
            quickintro: { title: quickintrotitle, lists: [...quicklistArr] },
            result: { title: resulttitle, lists: [...resultListArr] },
            conclusion: [...conclusionArr],
          },
        }
      );

    console.log(acknowledged, modifiedCount);

    res.status(201).json({ success: acknowledged, modifiedCount });
  }
);
