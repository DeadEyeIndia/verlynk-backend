import { Db, ObjectId } from "mongodb";

import { IComment } from "../../models/comment";
import {
  COMMENT_COLLECTION,
  POST_COLLECTION,
  USER_COLLECTION,
} from "../../utils/constants";

export const findCommentByPostId = async (db: Db, commentid: string) => {
  try {
    const comments = await db
      .collection<IComment>(COMMENT_COLLECTION)
      .aggregate([
        {
          $match: { post: new ObjectId(commentid) },
        },
        {
          $lookup: {
            from: USER_COLLECTION,
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            "user.email": 0,
            "user.password": 0,
            "user.updatedAt": 0,
            updatedAt: 0,
          },
        },
      ])
      .toArray();

    return comments;
  } catch {
    return null;
  }
};

export const findCommentByCommentId = async (db: Db, commentid: string) => {
  try {
    const comment = await db
      .collection<IComment>(COMMENT_COLLECTION)
      .findOne({ _id: new ObjectId(commentid) });

    return comment;
  } catch {
    return null;
  }
};
