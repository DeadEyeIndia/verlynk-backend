import express from "express";

import { isAuthenticatedUser } from "../middleware/auth";
import { uploadPosts } from "../utils/post-upload";
import { editPost, newPost } from "../controllers/post";

/**
 * Post Route
 *
 * POST CREATE - /create/post
 *
 * POST EDIT - /edit/post/:postid
 *
 * POST IMAGE UPLOAD EDIT - /edit/post/upload/:postid
 */
const router = express.Router();

router.post("/create/post", isAuthenticatedUser, uploadPosts, newPost);
router.put("/edit/post/:postid", isAuthenticatedUser, editPost);
router.put("/edit/post/upload/:postid", isAuthenticatedUser, uploadPosts);

export default router;
