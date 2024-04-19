/**
 * Reference to the global TypeScript declarations file.
 */
/// <reference path="global.d.ts" />

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import postRouter from "./routes/post";
import errorHandler from "./middleware/error";

/**
 * Express application initialization.
 */
const app = express();

/**
 * The port on which the server will listen for incoming requests.
 * Defaults to 3010 if not specified in the environment variables.
 * @type {number}
 */
const PORT: number = process.env.PORT || 3010;

/**
 * Configures Cross-Origin Resource Sharing (CORS) middleware to enable credentials.
 */
app.use(cors({ credentials: true }));

/**
 * Middleware for parsing JSON request bodies.
 */
app.use(bodyParser.json());

/**
 * Middleware for parsing cookies in incoming requests.
 */
app.use(cookieParser());

/**
 * Middleware for parsing URL-encoded request bodies with extended options.
 */
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
/**
 * Mounts the authentication router at the "/api" base path.
 * @param {string} "/api" - The base path for the router.
 * @param {Router} authRouter - The authentication router to be mounted.
 */
app.use("/api", authRouter);

/**
 * Mounts the user router at the "/api" base path.
 * @param {string} "/api" - The base path for the router.
 * @param {Router} userRouter - The user router to be mounted.
 */
app.use("/api", userRouter);

/**
 * Mounts the post router at the "/api" base path.
 * @param {string} "/api" - The base path for the router.
 * @param {Router} postRouter - The post router to be mounted.
 */
app.use("/api", postRouter);

/**
 * Middleware for handling errors in the application.
 */
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on port -> ${PORT}`);
});
