import express from "express";

import { isAuthenticatedUser } from "../middleware/auth";
import {
  editPost,
  getPost,
  newPost,
  editPostImage,
  deletePost,
} from "../controllers/post";
import { uploadPosts } from "../utils/post-upload";

/**
 * Post Route
 *
 * POST CREATE - /create/post
 *
 * POST FIND - /post/:postid
 *
 * POST EDIT - /edit/post/:postid
 *
 * POST IMAGE UPLOAD EDIT - /edit/post/upload/:postid
 *
 * POST DELETE - /delete/post/:postid
 */
const router = express.Router();

router.post("/create/post", isAuthenticatedUser, uploadPosts, newPost);
router.get("/post/:postid", getPost);
router.patch("/edit/post/:postid", isAuthenticatedUser, editPost);
router.patch(
  "/edit/post/upload/:postid",
  isAuthenticatedUser,
  uploadPosts,
  editPostImage
);
router.delete("/delete/post/:postid", isAuthenticatedUser, deletePost);

export default router;
