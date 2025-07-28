import { Router } from "express";
import { registerUser, loginUser, googleLogin } from "../controllers/auth.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/google").post(googleLogin); 

export default router;