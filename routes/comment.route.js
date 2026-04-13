import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { createComment, deleteComment, editComment, getAllCommentOnMyBlogs, getCommentsByPostId, likeComment } from "../controllers/comment.controller.js";


const router = express.Router();

router.post("/:id/create", isAuthenticated, createComment );
router.delete("/:id/delete", isAuthenticated, deleteComment );
router.put("/:id/edit", isAuthenticated, editComment );
router.get("/:id/like", isAuthenticated, likeComment);
router.get("/:id/comment", getCommentsByPostId);
router.get("/my-blogs/comments", isAuthenticated, getAllCommentOnMyBlogs);


export default router;
