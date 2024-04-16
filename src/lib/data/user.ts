import { Db, ObjectId } from "mongodb";

import { IUser } from "../../models/user";
import { USER_COLLECTION } from "../../utils/constants";

export const findUserByEmail = async (db: Db, email: string) => {
  try {
    const user = await db.collection<IUser>(USER_COLLECTION).findOne({ email });
    return user;
  } catch {
    return null;
  }
};

export const findUserById = async (db: Db, _id: string) => {
  try {
    const user = await db
      .collection<IUser>(USER_COLLECTION)
      .findOne({ _id: new ObjectId(_id) });

    return user;
  } catch {
    return null;
  }
};
