import { Db, ObjectId } from "mongodb";

import { IUser } from "../../models/user";
import { USER_COLLECTION } from "../../utils/constants";

/**
 *
 * @param db - DB connection Instance
 * @param email - User email for finding document
 * @returns - A user document or null
 */

export const findUserByEmail = async (db: Db, email: string) => {
  try {
    const user = await db.collection<IUser>(USER_COLLECTION).findOne({ email });
    return user;
  } catch {
    return null;
  }
};

/**
 *
 * @param db - DB connection Instance
 * @param id - User id for finding document
 * @returns - A user document or null
 */

export const findUserById = async (db: Db, id: string) => {
  try {
    const user = await db
      .collection<IUser>(USER_COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    return user;
  } catch {
    return null;
  }
};
