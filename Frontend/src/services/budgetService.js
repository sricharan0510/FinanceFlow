const STORAGE_KEY = 'budgets';

export const budgetService = {
  getBudgets() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  },
  setBudget(category, amount, period, note, rollover) {
    const budgets = budgetService.getBudgets();
    budgets[category] = { amount, period, note, rollover };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  },
  removeBudget(category) {
    const budgets = budgetService.getBudgets();
    delete budgets[category];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  },
  resetBudgets() {
    localStorage.removeItem(STORAGE_KEY);
  },
  exportBudgets() {
    const data = JSON.stringify(budgetService.getBudgets(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budgets.json';
    a.click();
    URL.revokeObjectURL(url);
  },
  importBudgets(file, cb) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        cb && cb();
      } catch {
        cb && cb('Invalid file');
      }
    };
    reader.readAsText(file);
  }
};
