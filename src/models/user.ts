import { Document, WithId } from "mongodb";

/**
 * Defines the schema for a user.
 * @interface
 */
export interface UserSchema extends Document {
  fullname: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface extending the UserSchema interface and adding MongoDB ID fields.
 * @interface
 */
export interface IUser extends WithId<UserSchema> {}
