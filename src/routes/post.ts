import express from "express";
import rateLimit from "express-rate-limit";

import { isAuthenticatedUser } from "../middleware/auth";
import {
  getPosts,
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
 * POST FIND - /posts
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

router.route("/create/post").post(
  rateLimit({
    limit: 100,
    windowMs: 24 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  isAuthenticatedUser,
  uploadPosts,
  newPost
);
router.route("/posts").get(getPosts);
router.route("/post/:postid").get(getPost);
router.route("/edit/post/:postid").patch(
  rateLimit({
    limit: 100,
    windowMs: 6 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  isAuthenticatedUser,
  editPost
);
router.route("/edit/post/upload/:postid").patch(
  rateLimit({
    limit: 100,
    windowMs: 6 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  isAuthenticatedUser,
  uploadPosts,
  editPostImage
);
router.route("/delete/post/:postid").delete(
  rateLimit({
    limit: 50,
    windowMs: 6 * 60 * 60 * 1000,
    message: "Too many requests, please try again later",
  }),
  isAuthenticatedUser,
  deletePost
);

export default router;
