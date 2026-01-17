import express from "express"
import { registerUser, loginUser, logoutUser, getUserProfile } from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js";

const userRoutes = express.Router()

userRoutes.post("/register", registerUser);
userRoutes.post("/auth/login", loginUser);
userRoutes.post("/logout", logoutUser);

userRoutes.get("/profile", protect, getUserProfile);

export default userRoutes;