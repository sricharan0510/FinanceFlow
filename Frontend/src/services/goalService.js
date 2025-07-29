// Add Goal and Savings API calls
import { apiService } from './apiService';

export const createGoal = (data) => apiService.addGoal(data);
export const getGoals = (params) => apiService.getGoals(params);
export const getGoal = (id) => apiService.getGoal(id);
export const updateGoal = (id, data) => apiService.updateGoal(id, data);
export const deleteGoal = (id) => apiService.deleteGoal(id);

export const addGoalSaving = (goalId, data) => apiService.addGoalSaving(goalId, data);
export const getGoalSavings = (goalId) => apiService.getGoalSavings(goalId);

export const getGoalsSummary = () => apiService.getGoalsSummary();
