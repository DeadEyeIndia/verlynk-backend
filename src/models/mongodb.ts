import { MongoClient, ServerApiVersion } from "mongodb";
import { IUser } from "./user";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let indexesCreated = false;

async function createIndexes(client: MongoClient) {
  if (indexesCreated) return client;
  const db = client.db();
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

export async function getMongoClient() {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client
      .connect()
      .then((client) => createIndexes(client));
  }

  return global._mongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  return client.db("verlynk-db");
}
