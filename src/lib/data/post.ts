import { Db, ObjectId } from "mongodb";

import { IPost } from "../../models/post";
import { POST_COLLECTION, USER_COLLECTION } from "../../utils/constants";

/**
 *
 * @param db - DB connection instance
 * @param id - Post id for finding document
 * @returns  A post document array containing author how created post
 */

export const findPostById = async (db: Db, id: string) => {
  try {
    const post = await db
      .collection<IPost>(POST_COLLECTION)
      .aggregate([
        {
          $match: { _id: new ObjectId(id) },
        },
        {
          $lookup: {
            from: USER_COLLECTION,
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: "$author",
        },
        {
          $project: {
            "author.email": 0,
            "author.password": 0,
            "author.updatedAt": 0,
          },
        },
      ])
      .toArray();

    return post;
  } catch {
    return null;
  }
};
