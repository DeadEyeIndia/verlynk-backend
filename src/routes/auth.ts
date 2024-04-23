import express from "express";
import rateLimit from "express-rate-limit";

import { userSignIn, userSignOut } from "../controllers/auth";
import { isAuthenticatedUser } from "../middleware/auth";

/**
 * Authentication Route
 *
 * USER SIGNIN - /signin - limiter
 *
 *
 * USER SIGNOUT - /signout
 */
const router = express.Router();

// router.use();

router.route("/signin").post(
  rateLimit({
    limit: 10,
    windowMs: 3 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  userSignIn
);
router.route("/signout").post(isAuthenticatedUser, userSignOut);

export default router;
