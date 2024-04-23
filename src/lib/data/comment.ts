import { Db, ObjectId } from "mongodb";

import { IComment } from "../../models/comment";
import { COMMENT_COLLECTION, USER_COLLECTION } from "../../utils/constants";

/**
 *
 * @param db DB connection instance
 * @param postid Post id for finding document
 * @returns A comment document array containing user
 */
export const findCommentByPostId = async (db: Db, postid: string) => {
  try {
    const comments = await db
      .collection<IComment>(COMMENT_COLLECTION)
      .aggregate([
        {
          $match: { post: new ObjectId(postid) },
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

/**
 *
 * @param db DB connection instance.
 * @param commentid Comment id for finding document.
 * @returns A comment document.
 */
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
