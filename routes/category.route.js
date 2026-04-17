import express from "express";
import {
  createCategory,
  getAllCategories,
  editCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/create", isAuthenticated, createCategory);
router.get("/allCategories", isAuthenticated, getAllCategories);
router.put("/:id/edit", isAuthenticated, editCategory);
router.delete("/:id/delete", isAuthenticated, deleteCategory);

export default router;
