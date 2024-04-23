import express from "express";

import {
  userSignUp,
  getUser,
  editUser,
  editUserPassword,
  deleteUser,
} from "../controllers/user";

import { isAuthenticatedUser } from "../middleware/auth";
import rateLimit from "express-rate-limit";

/**
 * USER Route
 *
 * USER SIGNUP - /signup
 *
 * USER PROFILE[ME] - /me
 *
 * USER EDIT(INFO) - /edit
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
router.route("/edit").patch(
  rateLimit({
    limit: 10,
    windowMs: 6 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  isAuthenticatedUser,
  editUser
);
router.route("/edit/password").patch(
  rateLimit({
    limit: 10,
    windowMs: 6 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  isAuthenticatedUser,
  editUserPassword
);

// Comment or Uncomment below route for deleting user by userId which will delete all posts and comments from that user.
router.route("/delete/:userid").delete(
  rateLimit({
    limit: 1000,
    windowMs: 6 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  isAuthenticatedUser,
  deleteUser
);

export default router;
