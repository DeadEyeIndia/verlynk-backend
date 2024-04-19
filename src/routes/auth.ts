import express from "express";

import { userSignIn, userSignOut } from "../controllers/auth";
import { isAuthenticatedUser } from "../middleware/auth";

/**
 * Authentication Route
 *
 * USER SIGNIN - /signin
 *
 *
 * USER SIGNOUT - /signout
 */
const router = express.Router();

router.route("/signin").post(userSignIn);
router.route("/signout").post(isAuthenticatedUser, userSignOut);

export default router;