/**
 * Picks specific properties from an object and returns a new object containing only those properties.
 * @param {T} obj - The source object.
 * @param {...K} props - The properties to pick from the source object.
 * @returns {Pick<T, K>} A new object containing only the specified properties.
 * @template T - The type of the source object.
 * @template K - The keys of the properties to pick.
 */

import { Document } from "mongodb";

export function pick<T, K extends keyof T>(obj: T, ...props: K[]): Pick<T, K> {
  return props.reduce((result, prop) => {
    result[prop] = obj[prop];
    return result;
  }, {} as Pick<T, K>);
}

/**
 * The name of the MongoDB database.
 * Defaults to "verlynk-db" if not specified in the environment variables.
 * @type {string}
 */
export const DB_NAME: string = process.env.DB_NAME || "verlynk-db";

/**
 * The name of the user collection in the MongoDB database.
 * @type {string}
 */
export const USER_COLLECTION: string = "users";

/**
 * The name of the post collection in the MongoDB database.
 * @type {string}
 */
export const POST_COLLECTION: string = "posts";

/**
 * The name of the comment collection in the MongoDB database.
 * @type {string}
 */
export const COMMENT_COLLECTION: string = "comments";
