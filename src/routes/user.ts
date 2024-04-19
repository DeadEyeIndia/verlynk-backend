import express from "express";

import { userSignUp, getUser } from "../controllers/user";

import { isAuthenticatedUser } from "../middleware/auth";

/**
 * USER Route
 *
 * USER SIGNUP - /signup
 *
 * USER PROFILE[ME] - /me
 */
const router = express.Router();

router.route("/signup").post(userSignUp);
router.route("/me").get(isAuthenticatedUser, getUser);

export default router;
