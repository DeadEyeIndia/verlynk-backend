import { MongoClient, ObjectId } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      JWT_SECRET: string;
      NODE_ENV: "production" | "development";
    }
  }

  namespace Express {
    interface Request {
      user: {
        _id: ObjectId;
        email: string;
      };
    }
  }
}
