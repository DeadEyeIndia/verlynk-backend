import { Db, ObjectId } from "mongodb";

import { IPost } from "../../models/post";
import { POST_COLLECTION } from "../../utils/constants";

/**
 *
 * @param db - DB connection instance
 * @param id - Post id for finding document
 * @returns  A post document containing author how created post
 */

export const findPostById = async (db: Db, id: string) => {
  try {
    const post = await db
      .collection<IPost>(POST_COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    return post;
  } catch {
    return null;
  }
};
