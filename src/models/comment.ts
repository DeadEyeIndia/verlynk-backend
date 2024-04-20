import { Document, ObjectId, WithId } from "mongodb";

/**
 * Defines the schema for a comment.
 * @interface
 */
export interface CommentSchema extends Document {
  commenttext: string;
  user: ObjectId;
  post: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface extending the PostSchema interface and adding MongoDB ID fields.
 * @interface
 */
export interface IComment extends WithId<CommentSchema> {}
