import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
    addTransaction, 
    getTransactions, 
    updateTransaction, 
    deleteTransaction,
    getDashboardSummary 
} from "../controllers/transaction.controller.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);

router.route("/").post(addTransaction).get(getTransactions);
router.route("/:id").put(updateTransaction).delete(deleteTransaction);
router.route("/dashboard/summary").get(getDashboardSummary);


export default router;