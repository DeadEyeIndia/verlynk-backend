import express from "express";
// import rateLimit from "express-rate-limit";

import { getPostImage } from "../controllers/image";

/**
 * Image Route
 *
 * POST IMAGE - /post/:filename - limiter
 *
 */
const router = express.Router();

router.route("/post/image/:filename").get(getPostImage);

export default router;
