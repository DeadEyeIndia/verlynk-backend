/// <reference path="global.d.ts" />

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import errorHandler from "./middleware/error";

const app = express();
const PORT = process.env.PORT || 3010;
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use("/api", authRouter);
app.use("/api", userRouter);

// Middleware error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on port -> ${PORT}`);
});
