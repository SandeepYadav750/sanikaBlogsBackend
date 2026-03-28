import express from "express";
import { singleUpload } from "../middleware/multer.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  createBlog,
  deleteBlog,
  disLikeBlog,
  getMyTotalBlocks,
  getPublishedBlog,
  likeBlog,
  listBlog,
  togglePublishedBlog,
  updateBlog,
} from "../controllers/blog.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, singleUpload, createBlog);
router.put("/update/:blogId", isAuthenticated, singleUpload, updateBlog);
router.get("/list", isAuthenticated, listBlog);
router.delete("/delete/:id", isAuthenticated, deleteBlog);
router.get("/:id/like", isAuthenticated, likeBlog);
router.get("/:id/dislike", isAuthenticated, disLikeBlog);
router.get("/my-blogs/likes", isAuthenticated, getMyTotalBlocks);
router.get("/get-published-blogs", getPublishedBlog);
router.patch("/:id", togglePublishedBlog);

export default router;
