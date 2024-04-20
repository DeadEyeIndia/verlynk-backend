import express from "express";

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

router.post("/add/comment/:postid", isAuthenticatedUser, newComment);
router.get("/comments/:postid", isAuthenticatedUser, getPostComments);
router.delete(
  "/delete/comment/:postid/:commentid",
  isAuthenticatedUser,
  deleteComment
);

export default router;
