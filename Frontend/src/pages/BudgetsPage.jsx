import React, { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES } from '../services/categoryOptions';
import { apiService } from '../services/apiService';
import { budgetService } from '../services/budgetService';
import { customCategoriesService } from '../services/customCategoriesService';
import { budgetHistoryService } from '../services/budgetHistoryService';
import { budgetExportService } from '../services/budgetExportService';

const PERIODS = ['monthly', 'weekly'];

function getPeriodLabel(period) {
  return period === 'weekly' ? 'This Week' : 'This Month';
}

function getPeriodRange(period) {
  const now = new Date();
  if (period === 'weekly') {
    // Start of week (Monday)
    const day = now.getDay() || 7;
    const start = new Date(now);
    start.setDate(now.getDate() - day + 1);
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
    return { from: start, to: end };
  } else {
    // Monthly
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from: start, to: end };
  }
}

function getTransactionsInPeriod(transactions, period) {
  const { from, to } = getPeriodRange(period);
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d >= from && d <= to && t.type === 'expense';
  });
}

function getSuggestions(category, spent, budget) {
  if (budget === 0) return null;
  const percent = spent / budget;
  if (percent > 1.1) return 'You have exceeded your budget! Consider reviewing your spending.';
  if (percent > 1) return 'You are over budget. Try to cut back on this category.';
  if (percent > 0.8) return 'You are nearing your budget limit. Monitor your spending closely.';
  if (percent > 0.5) return 'You have used over half your budget.';
  return null;
}



export default function BudgetsPage() {
  const [budgets, setBudgets] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ category: EXPENSE_CATEGORIES[0], amount: '', period: 'monthly', note: '', rollover: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importError, setImportError] = useState('');
  const [history, setHistory] = useState({});
  const [resetAlert, setResetAlert] = useState(false);

  useEffect(() => {
    setBudgets(budgetService.getBudgets());
    apiService.getTransactions({}).then(setTransactions);
    setCustomCategories(customCategoriesService.getCategories());
    setHistory(budgetHistoryService.getHistory());
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = e => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError('Enter a valid budget amount.');
      return;
    }
    setSaving(true);
    budgetService.setBudget(form.category, amount, form.period, form.note, form.rollover);
    setBudgets(budgetService.getBudgets());
    setSaving(false);
    setForm(f => ({ ...f, amount: '', note: '' }));
  };

  const handleRemove = category => {
    budgetService.removeBudget(category);
    setBudgets(budgetService.getBudgets());
  };

  const handleAddCategory = () => {
    if (newCategory && !customCategories.includes(newCategory) && !EXPENSE_CATEGORIES.includes(newCategory)) {
      customCategoriesService.addCategory(newCategory);
      setCustomCategories(customCategoriesService.getCategories());
      setNewCategory('');
    }
  };

  const handleRemoveCategory = cat => {
    customCategoriesService.removeCategory(cat);
    setCustomCategories(customCategoriesService.getCategories());
  };

  const handleResetBudgets = () => {
    if (window.confirm('Are you sure you want to reset all budgets?')) {
      Object.keys(budgets).forEach(budgetService.removeBudget);
      setBudgets({});
      setResetAlert(true);
      setTimeout(() => setResetAlert(false), 2000);
    }
  };

  const handleExport = () => budgetExportService.exportBudgets();
  const handleImport = e => {
    setImportError('');
    const file = e.target.files[0];
    if (!file) return;
    budgetExportService.importBudgets(file, err => {
      if (err) setImportError('Invalid file.');
      else setBudgets(budgetService.getBudgets());
    });
  };

  // Budget history chart data
  const historyChartData = () => {
    const months = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('default', { month: 'short', year: '2-digit' });
    });
    const datasets = Object.keys(budgets).map(cat => {
      const catHistory = (history[cat] || []).slice(-6);
      return {
        label: cat,
        data: months.map((m, idx) => catHistory[idx]?.spent || 0),
        fill: false,
        borderColor: pieData().datasets[0].backgroundColor[idx % 12],
      };
    });
    return { labels: months, datasets };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-indigo-800">Budgets</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={handleExport} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Export Budgets</button>
        <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
          Import Budgets
          <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </label>
        <button onClick={handleResetBudgets} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Reset All</button>
        {resetAlert && <span className="text-green-600 font-semibold ml-2">Budgets reset!</span>}
        {importError && <span className="text-red-500 ml-2">{importError}</span>}
      </div>
      <form className="flex flex-wrap gap-4 items-end mb-8" onSubmit={handleSave}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="p-2 border rounded-lg">
            {[...EXPENSE_CATEGORIES, ...customCategories].map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input name="amount" type="number" min="1" value={form.amount} onChange={handleChange} className="p-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
          <select name="period" value={form.period} onChange={handleChange} className="p-2 border rounded-lg">
            {PERIODS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <input name="note" value={form.note} onChange={handleChange} className="p-2 border rounded-lg" placeholder="Optional note" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="rollover" checked={form.rollover} onChange={handleChange} />
          <label className="text-sm text-gray-700">Rollover unused</label>
        </div>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg" disabled={saving}>Set Budget</button>
        {error && <span className="text-red-500 ml-2">{error}</span>}
      </form>
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1">Add Custom Category</label>
        <div className="flex gap-2">
          <input value={newCategory} onChange={e => setNewCategory(e.target.value)} className="p-2 border rounded-lg" placeholder="New category" />
          <button type="button" onClick={handleAddCategory} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {customCategories.map(cat => (
            <span key={cat} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
              {cat}
              <button onClick={() => handleRemoveCategory(cat)} className="text-red-500 ml-1">&times;</button>
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {Object.entries(budgets).length === 0 && <p className="text-gray-500">No budgets set yet.</p>}
        {Object.entries(budgets).map(([category, { amount, period, note, rollover }]) => {
          const txs = getTransactionsInPeriod(transactions.filter(t => t.category === category), period);
          const spent = txs.reduce((sum, t) => sum + t.amount, 0);
          const percent = Math.min(100, Math.round((spent / amount) * 100));
          const suggestion = getSuggestions(category, spent, amount);
          const over = spent > amount;
          return (
            <div key={category} className="p-4 rounded-xl border shadow-sm bg-gray-50">
              <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                <div className="font-semibold text-lg text-indigo-800">{category} <span className="text-xs text-gray-500">({getPeriodLabel(period)})</span></div>
                <button onClick={() => handleRemove(category)} className="text-red-500 hover:underline text-sm">Remove</button>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <div className="text-gray-700">Budget: <span className="font-bold">₹{amount.toLocaleString()}</span></div>
                <div className="text-gray-700">Spent: <span className={`font-bold ${over ? 'text-red-600' : 'text-indigo-700'}`}>₹{spent.toLocaleString()}</span></div>
                <div className="flex-1 min-w-[120px]">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all duration-300 ${over ? 'bg-red-500' : percent > 80 ? 'bg-yellow-400' : 'bg-indigo-500'}`} style={{ width: percent + '%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{percent}% of budget used</div>
                </div>
              </div>
              {note && <div className="text-xs text-gray-600 mb-1">Note: {note}</div>}
              {rollover && <div className="text-xs text-blue-600 mb-1">Rollover enabled</div>}
              {suggestion && <div className={`mt-2 text-sm font-medium ${over ? 'text-red-600' : 'text-yellow-700'}`}>{suggestion}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
