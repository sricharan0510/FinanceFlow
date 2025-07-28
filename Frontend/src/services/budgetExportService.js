// Service for exporting/importing budgets as JSON
import { budgetService } from './budgetService';

export const budgetExportService = {
  exportBudgets() {
    const data = budgetService.getBudgets();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budgets.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  importBudgets(file, cb) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        Object.entries(data).forEach(([cat, val]) => {
          budgetService.setBudget(cat, val.amount, val.period);
        });
        cb && cb(null);
      } catch (err) {
        cb && cb(err);
      }
    };
    reader.readAsText(file);
  }
};
