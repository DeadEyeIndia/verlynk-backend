import {
  Db,
  GridFSBucket,
  MongoClient,
  MongoClientOptions,
  ServerApiVersion,
} from "mongodb";

import { IUser } from "./user";
import {
  COMMENT_COLLECTION,
  POST_COLLECTION,
  USER_COLLECTION,
} from "../utils/constants";

/**
 * The MongoDB connection URI.
 * Defaults to "mongodb://localhost:27017/" if not provided in environment variables.
 * @type {string}
 */
const uri: string = process.env.MONGODB_URI || "mongodb://localhost:27017/";
const dbName: string = process.env.DB_NAME || "verlynk-db";
const dbBucketName: string = process.env.DB_BUCKET_NAME || "verlynk-files-db";
const bucketName: string = process.env.BUCKET_NAME || "post";

/**
 * Options for MongoDB client configuration.
 * @type {object}
 * @property {object} serverApi - Configuration options for MongoDB Server API.
 * @property {ServerApiVersion} serverApi.version - The version of MongoDB Server API to use.
 * @property {boolean} serverApi.strict - Whether strict mode is enabled for the Server API.
 * @property {boolean} serverApi.deprecationErrors - Whether to throw deprecation errors for the Server API.
 */
const options: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let indexesCreated: boolean = false;

/**
 * Creates indexes in the MongoDB database if not already created.
 * @param {MongoClient} client - The MongoDB client instance.
 * @returns {Promise<MongoClient>} A promise resolving to the MongoDB client instance.
 *
 * Create [USER] indexes and [USER, POST, COMMENT] collection validations
 */
async function createIndexes(client: MongoClient): Promise<MongoClient> {
  if (indexesCreated) return client;
  const db = client.db(dbName);
  await Promise.all([
    db.createCollection(USER_COLLECTION, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["fullname", "email", "password"],
          additionalProperties: false,
          properties: {
            _id: {
              bsonType: "objectId",
              description: "Id is required",
            },
            fullname: {
              bsonType: "string",
              description: "Fullname is required",
              minLength: 3,
            },
            email: {
              bsonType: "string",
              description: "Email is required",
              pattern: "^\\S+@\\S+\\.\\S+$",
            },
            password: {
              bsonType: "string",
              description: "Password is required",
              minLength: 8,
              pattern: "^(?=.*[A-Z])(?=.*[a-z])(?=.*d).{8,}$",
            },
            createdAt: {
              bsonType: "date",
            },
            updatedAt: {
              bsonType: "date",
            },
          },
        },
      },
    }),

    db.createCollection(POST_COLLECTION, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: [
            "title",
            "postimage",
            "intro",
            "quickintro",
            "result",
            "author",
            "conclusion",
          ],
          additionalProperties: false,
          properties: {
            _id: {
              bsonType: "objectId",
            },
            title: {
              bsonType: "string",
              description: "Title is required",
              minLength: 5,
            },
            postimage: {
              type: "object",
              required: ["id", "filename"],
              additionalProperties: false,
              properties: {
                id: {
                  bsonType: "objectId",
                  description: "Image Id is required",
                },
                filename: {
                  bsonType: "string",
                  description: "Image filename is required",
                },
              },
            },
            intro: {
              bsonType: "array",
              description: "Intro is required",
              minItems: 1,
              additionalProperties: false,
              items: {
                bsonType: "string",
                description: "Intro item is required",
              },
            },
            quickintro: {
              bsonType: "object",
              description: "Quick intro is required",
              required: ["title", "lists"],
              properties: {
                title: {
                  bsonType: "string",
                  description: "Quick intro title is required",
                },
                lists: {
                  bsonType: "array",
                  description: "Quick intro list is required",
                  minItems: 1,
                  additionalProperties: false,
                  items: {
                    bsonType: "string",
                    description: "Quick intro item is required",
                  },
                },
              },
            },
            result: {
              bsonType: "object",
              description: "Result is required",
              required: ["title", "lists"],
              properties: {
                title: {
                  bsonType: "string",
                  description: "Result title is required",
                },
                lists: {
                  bsonType: "array",
                  description: "Result list is required",
                  minItems: 1,
                  additionalProperties: false,
                  items: {
                    bsonType: "string",
                    description: "Result item is required",
                  },
                },
              },
            },
            author: {
              bsonType: "objectId",
              description: "Author is required",
            },
            conclusion: {
              bsonType: "array",
              description: "Intro is required",
              minItems: 1,
              additionalProperties: false,
              items: {
                bsonType: "string",
                description: "Conclusion item is required",
              },
            },
            createdAt: {
              bsonType: "date",
            },
            updatedAt: {
              bsonType: "date",
            },
          },
        },
      },
    }),

    db.createCollection(COMMENT_COLLECTION, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["commenttext", "user", "post"],
          additionalProperties: false,
          properties: {
            _id: {
              bsonType: "objectId",
              description: "Id is required",
            },
            commenttext: {
              type: "string",
              description: "Comment text is required",
              minLength: 3,
              maxLength: 200,
            },
            user: {
              bsonType: "objectId",
              description: "User is required",
            },
            post: {
              bsonType: "objectId",
              description: "Post is required",
            },
            createdAt: {
              bsonType: "date",
            },
            updatedAt: {
              bsonType: "date",
            },
          },
        },
      },
    }),

    db
      .collection<IUser>(USER_COLLECTION)
      .createIndexes([{ key: { email: 1 }, unique: true }], {}),
  ]);

  indexesCreated = true;
  return client;
}

/**
 * Retrieves a MongoDB client instance and GridFSBucket instance.
 * If not already created, it initializes a new client and bucket.
 * @returns {Promise<{client: Promise<MongoClient>, bucket: GridFSBucket}>} A promise resolving to an object containing the MongoDB client promise and GridFSBucket instance.
 */
export async function getMongoClient(): Promise<{
  client: Promise<MongoClient>;
  bucket: GridFSBucket;
}> {
  const client = new MongoClient(uri, options);

  const mongo = client.connect().then((client) => createIndexes(client));
  const bucket = new GridFSBucket(client.db(dbBucketName), {
    bucketName: bucketName,
  });

  return { client: mongo, bucket: bucket };
}
