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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

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

  // Edit modal save
  const handleEditSave = e => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError('Enter a valid budget amount.');
      return;
    }
    setSaving(true);
    // Remove old budget if category changed
    if (editCategory && editCategory !== form.category) {
      budgetService.removeBudget(editCategory);
    }
    budgetService.setBudget(form.category, amount, form.period, form.note, form.rollover);
    setBudgets(budgetService.getBudgets());
    setSaving(false);
    setShowEditModal(false);
    setEditCategory(null);
    setForm({ category: EXPENSE_CATEGORIES[0], amount: '', period: 'monthly', note: '', rollover: false });
  };


  const handleRemove = category => {
    budgetService.removeBudget(category);
    setBudgets(budgetService.getBudgets());
  };

  const handleEdit = (category, budget) => {
    setForm({
      category,
      amount: budget.amount,
      period: budget.period,
      note: budget.note || '',
      rollover: budget.rollover || false
    });
    setEditCategory(category);
    setShowEditModal(true);
    setError('');
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
                <div className="font-semibold text-lg text-indigo-800 flex items-center gap-2">
                  {category} <span className="text-xs text-gray-500">({getPeriodLabel(period)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(category, { amount, period, note, rollover })} className="p-1 hover:bg-gray-200 rounded" title="Edit">
                    {/* Pencil icon (edit) as in SubscriptionsPage */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3a1 1 0 001 1h3" />
                    </svg>
                  </button>
                  <button onClick={() => handleRemove(category)} className="p-1 hover:bg-gray-200 rounded" title="Delete">
                    {/* Trash bin icon (delete) as in SubscriptionsPage */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Edit Budget</h2>
            <form onSubmit={handleEditSave}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <select name="category" value={form.category} onChange={handleChange} className="w-full p-2 border rounded-lg">
                  {[...EXPENSE_CATEGORIES, ...customCategories].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount (₹)</label>
                <input name="amount" type="number" value={form.amount} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Period</label>
                <select name="period" value={form.period} onChange={handleChange} className="w-full p-2 border rounded-lg">
                  {PERIODS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Note</label>
                <input name="note" value={form.note} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Optional note" />
              </div>
              <div className="mb-6 flex items-center gap-2">
                <input type="checkbox" name="rollover" checked={form.rollover} onChange={handleChange} />
                <label className="text-gray-700">Rollover unused</label>
              </div>
              {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => { setShowEditModal(false); setEditCategory(null); setError(''); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
