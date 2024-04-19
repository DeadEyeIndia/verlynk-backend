import { ObjectId, WithId } from "mongodb";

/**
 * Defines the schema for a post.
 * @interface
 */
export interface PostSchema {
  title: string;
  postimage: {
    id: ObjectId;
    filename: string;
  };
  intro: string[];
  quickintro: QuickIntroSchema;
  result: ResultSchema;
  conclusion: string[];
  author: ObjectId;
  comments?: [ObjectId];
}

/**
 * Defines the schema for the quick introduction section of a post.
 * @interface
 */
export interface QuickIntroSchema {
  title: string;
  lists: string[];
}

/**
 * Defines the schema for the result section of a post.
 * @interface
 */
export interface ResultSchema {
  title: string;
  lists: string[];
}

/**
 * Interface extending the PostSchema interface and adding MongoDB ID fields.
 * @interface
 */
export interface IPost extends WithId<PostSchema> {}
