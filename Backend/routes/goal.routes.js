import express from 'express';
import * as goalController from '../controllers/goal.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// Goal CRUD
router.post('/', auth, goalController.createGoal);
router.get('/', auth, goalController.getGoals);
router.get('/summary', auth, goalController.getGoalsSummary);
router.get('/:id', auth, goalController.getGoal);
router.put('/:id', auth, goalController.updateGoal);
router.delete('/:id', auth, goalController.deleteGoal);

// Savings for a goal
router.post('/:goalId/savings', auth, goalController.addSaving);
router.get('/:goalId/savings', auth, goalController.getSavings);

export default router;
