import { ObjectId, WithId } from "mongodb";

export interface UserSchema {
  fullname: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser extends WithId<UserSchema> {}
