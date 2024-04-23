import { Db, ObjectId } from "mongodb";

import { IPost } from "../../models/post";
import { POST_COLLECTION, USER_COLLECTION } from "../../utils/constants";

/**
 *
 * @param db DB connection instance
 * @param query Query params containing { page: string }
 * @returns A Promise containing totalPosts and list of posts.
 */
export const findPostByQueryParams = async (
  db: Db,
  query: { page: string }
) => {
  try {
    let page: number = Number(query.page);
    if (!page) {
      page = 1;
    }
    const initialPosts: number = 8;
    const skip = (page - 1) * initialPosts;

    const totalPosts = await db
      .collection<IPost>(POST_COLLECTION)
      .find()
      .toArray();

    const posts = await db
      .collection<IPost>(POST_COLLECTION)
      .aggregate([
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: initialPosts,
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
            updatedAt: 0,
          },
        },
      ])
      .toArray();

    return { posts: posts, totalPosts: totalPosts.length };
  } catch {
    return null;
  }
};

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
