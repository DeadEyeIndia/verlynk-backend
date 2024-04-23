import express from "express";

import { userSignUp, getUser } from "../controllers/user";

import { isAuthenticatedUser } from "../middleware/auth";
import rateLimit from "express-rate-limit";

/**
 * USER Route
 *
 * USER SIGNUP - /signup
 *
 * USER PROFILE[ME] - /me
 */
const router = express.Router();

router.route("/signup").post(
  rateLimit({
    limit: 10,
    windowMs: 6 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  userSignUp
);
router.route("/me").get(isAuthenticatedUser, getUser);

export default router;
