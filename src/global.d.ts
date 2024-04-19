import { GridFSBucket, MongoClient, ObjectId } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | null;
  var bucket: GridFSBucket | null;
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      JWT_SECRET: string;
      DB_NAME: string;
      PORT: number;
      NODE_ENV: "production" | "development";
    }
  }

  namespace Express {
    interface Request {
      user: {
        _id: ObjectId;
        email: string;
      };
      postimages: {
        id: ObjectId;
        filename: string;
      };
    }
  }
}
