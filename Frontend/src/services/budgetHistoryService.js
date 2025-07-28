// Service for storing budget history (localStorage)
const STORAGE_KEY = 'budgetHistory';

export const budgetHistoryService = {
  getHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  },
  addHistory(category, period, month, spent, budget) {
    const history = budgetHistoryService.getHistory();
    if (!history[category]) history[category] = [];
    history[category].push({ period, month, spent, budget });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },
  clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
