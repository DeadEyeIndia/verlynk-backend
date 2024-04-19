import {
  Db,
  GridFSBucket,
  MongoClient,
  MongoClientOptions,
  ServerApiVersion,
} from "mongodb";

import { IUser } from "./user";

/**
 * The MongoDB connection URI.
 * Defaults to "mongodb://localhost:27017/" if not provided in environment variables.
 * @type {string}
 */
const uri: string = process.env.MONGODB_URI || "mongodb://localhost:27017/";

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
 */
async function createIndexes(client: MongoClient): Promise<MongoClient> {
  if (indexesCreated) return client;
  const db = client.db("verlynk-db");
  await Promise.all([
    db
      .collection<IUser>("users")
      .createIndexes([{ key: { email: 1 }, unique: true }], {
        dbName: "verlynk-db",
      }),
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
  if (!global._mongoClientPromise || !global.bucket) {
    const client = new MongoClient(uri, options);
    const bucket = new GridFSBucket(client.db("verlynk-files-db"), {
      bucketName: "images",
    });

    global._mongoClientPromise = client
      .connect()
      .then((client) => createIndexes(client));
    global.bucket = bucket;

    return { client: global._mongoClientPromise, bucket: global.bucket };
  }

  return { client: global._mongoClientPromise, bucket: global.bucket };
}

/**
 * Retrieves the MongoDB database instance.
 * @returns {Promise<Db>} A promise resolving to the MongoDB database instance.
 */
export async function getMongoDb(): Promise<Db> {
  const { client } = await getMongoClient();
  return (await client).db("verlynk-db");
}
