import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { generateMonthlyReport } from "../controllers/report.controller.js";

const router = Router();

// Secure all routes in this file
router.use(verifyJWT);

router.route("/monthly").post(generateMonthlyReport);

export default router;
