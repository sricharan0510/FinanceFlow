import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import {
    getSubscriptions,
    getSubscription,
    createSubscription,
    updateSubscription,
    deleteSubscription
} from '../controllers/subscription.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.get('/', getSubscriptions);
router.get('/:id', getSubscription);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;
