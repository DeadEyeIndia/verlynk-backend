import express from "express";
import rateLimit from "express-rate-limit";

import { isAuthenticatedUser } from "../middleware/auth";
import {
  newComment,
  getPostComments,
  deleteComment,
} from "../controllers/comment";

/**
 * Comment Route
 *
 * COMMENT ADD - /add/comment/:postid
 *
 * COMMENT VIEW - /comments/:postid
 *
 * COMMENT DELETE - /delete/comment/:postid
 */
const router = express.Router();

router.route("/add/comment/:postid").post(
  rateLimit({
    limit: 100,
    windowMs: 6 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  isAuthenticatedUser,
  newComment
);
router.route("/comments/:postid").get(getPostComments);
router.route("/delete/comment/:postid/:commentid").delete(
  rateLimit({
    limit: 100,
    windowMs: 6 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  isAuthenticatedUser,
  deleteComment
);

export default router;
