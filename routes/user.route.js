import express from "express";
import { register, login, logout, updateProfile } from "../controllers/user.controller.js";
import { singleUpload } from "../middleware/multer.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.put("/profile/update", isAuthenticated, singleUpload, updateProfile);

export default router;