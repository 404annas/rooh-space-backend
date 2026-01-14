import express from "express"
import { registerUser, loginUser, logoutUser } from "../controllers/userController.js"

const userRoutes = express.Router()

userRoutes.post("/register", registerUser);
userRoutes.post("/auth/login", loginUser);
userRoutes.post("/logout", logoutUser);

export default userRoutes;