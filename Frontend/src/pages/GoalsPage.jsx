import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  addGoalSaving,
  getGoalSavings,
  getGoalsSummary
} from '../services/goalService';

const priorities = ['Low', 'Medium', 'High'];

function ProgressBar({ value, max }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="bg-indigo-500 h-3 rounded-full transition-all"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}

function GoalForm({ onSave, onCancel, initial }) {
  const [form, setForm] = useState(
    initial || {
      title: '',
      targetAmount: '',
      startDate: '',
      endDate: '',
      priority: 'Medium',
      notes: '',
      image: ''
    }
  );
  const [error, setError] = useState('');
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('Goal title is required.');
      return;
    }
    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }
    if (!form.startDate) {
      setError('Start date is required.');
      return;
    }
    onSave(form);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{initial ? 'Edit' : 'Add'} Goal</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Goal Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Target Amount</label>
            <input name="targetAmount" type="number" value={form.targetAmount} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Start Date</label>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">End Date</label>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="w-full p-2 border rounded-lg">
              {priorities.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Image/Icon URL (optional)</label>
            <input name="image" value={form.image} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full p-2 border rounded-lg" />
          </div>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddSavingForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ amount: '', date: '', note: '' });
  const [error, setError] = useState('');
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!form.date) {
      setError('Date is required.');
      return;
    }
    onSave(form);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Add Saving</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Amount</label>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Note (optional)</label>
            <input name="note" value={form.note} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="Note (optional)" />
          </div>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [detailsSavings, setDetailsSavings] = useState([]);
  const [showSavingForm, setShowSavingForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '', minAmount: '', maxAmount: '', sortBy: '' });
  // Remove backend summary, use filtered goals for summary boxes

  // --- Sidebar duplication note ---
  // If you see two sidebars, check your router or parent component for double wrapping with MainLayout. Only wrap your page once.

  useEffect(() => {
    fetchGoals();
    // eslint-disable-next-line
  }, [filter]);

  const fetchGoals = async () => {
    try {
      const res = await getGoals(filter);
      let data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      // Apply custom status filter on frontend
      if (filter.status === 'active') {
        data = data.filter(g => (g.savingsTotal || 0) < g.targetAmount);
      } else if (filter.status === 'completed') {
        data = data.filter(g => (g.savingsTotal || 0) >= g.targetAmount);
      }
      setGoals(data);
    } catch (err) {
      setGoals([]);
    }
  };

  // Calculate summary from filtered goals
  const activeGoals = goals.filter(g => (g.savingsTotal || 0) < g.targetAmount).length;
  const completedGoals = goals.filter(g => (g.savingsTotal || 0) >= g.targetAmount).length;
  const totalSaved = goals.reduce((acc, g) => acc + (g.savingsTotal || 0), 0);
  const totalNeeded = goals.reduce((acc, g) => acc + (g.targetAmount - (g.savingsTotal || 0)), 0);

  // Filtering and sorting UI
  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilter(f => ({ ...f, [name]: value }));
  };
  const handleClearFilters = () => {
    setFilter({ status: '', priority: '', minAmount: '', maxAmount: '', sortBy: '' });
  };

  // Add Goal
  const handleAddGoal = async (goalData) => {
    try {
      await createGoal(goalData);
      setEditGoal(null);
      fetchGoals();
    } catch (err) {
      // Optionally show error to user
      console.error('Failed to add goal:', err);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId) => {
    try {
      await deleteGoal(goalId);
      setExpandedGoalId(null);
      fetchGoals();
    } catch (err) {
      // Optionally show error to user
      console.error('Failed to delete goal:', err);
    }
  };

  // Handler for expanding/collapsing goal details
  const handleExpandGoal = async (goalId) => {
    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
      setDetailsSavings([]);
    } else {
      setExpandedGoalId(goalId);
      try {
        const res = await getGoalSavings(goalId);
        // Some APIs return array directly, some in .data
        if (Array.isArray(res)) {
          setDetailsSavings(res);
        } else if (Array.isArray(res?.data)) {
          setDetailsSavings(res.data);
        } else {
          setDetailsSavings([]);
        }
      } catch {
        setDetailsSavings([]);
      }
    }
  };

  // Add missing handleAddSaving function
  const handleAddSaving = async (goalId, data) => {
    await addGoalSaving(goalId, data);
    setShowSavingForm(false);
    setSelectedGoal(null);
    handleExpandGoal(goalId); // refresh savings
    fetchGoals();
  };

  const handleSaveGoal = async (goalData) => {
    try {
      await updateGoal(goalData._id, goalData);
      fetchGoals();
    } catch (err) {
      // Optionally show error to user
      console.error('Failed to update goal:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-indigo-900">Goals & Savings</h1>
      {/* Summary Boxes */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center border-2 border-green-200 min-h-[110px] p-6">
          <div className="text-gray-500 text-sm mb-1">Active Goals</div>
          <div className="text-4xl font-extrabold text-green-600">{activeGoals}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center border-2 border-blue-200 min-h-[110px] p-6">
          <div className="text-gray-500 text-sm mb-1">Completed Goals</div>
          <div className="text-4xl font-extrabold text-blue-600">{completedGoals}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center border-2 border-pink-200 min-h-[110px] p-6">
          <div className="text-gray-500 text-sm mb-1">Total Needed to Reach All Goals</div>
          <div className="text-4xl font-extrabold text-pink-600">₹{totalNeeded.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center border-2 border-indigo-200 min-h-[110px] p-6">
          <div className="text-gray-500 text-sm mb-1">Total Saved</div>
          <div className="text-4xl font-extrabold text-indigo-700">₹{totalSaved.toLocaleString()}</div>
        </div>
      </div>
      {/* Filters */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select name="status" value={filter.status} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg bg-white min-w-[110px]">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Priority</label>
            <select name="priority" value={filter.priority} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg bg-white min-w-[120px]">
              <option value="">All Priorities</option>
              {priorities.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Min Amount</label>
            <input name="minAmount" type="number" value={filter.minAmount} onChange={handleFilterChange} placeholder="Min" className="p-2 border border-gray-300 rounded-lg w-20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Max Amount</label>
            <input name="maxAmount" type="number" value={filter.maxAmount} onChange={handleFilterChange} placeholder="Max" className="p-2 border border-gray-300 rounded-lg w-20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sort By</label>
            <select name="sortBy" value={filter.sortBy} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg bg-white min-w-[110px]">
              <option value="">Sort By</option>
              <option value="deadline">Deadline</option>
              <option value="amountRemaining">Amount Remaining</option>
            </select>
          </div>
          <button onClick={handleClearFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg shadow whitespace-nowrap">Clear Filters</button>
          <button onClick={() => { setEditGoal({}); }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow whitespace-nowrap">+ Add New Goal</button>
        </div>
      </div>
      {/* Goals List - Card Style */}
      <div className="grid gap-8">
        {(goals || []).length === 0 && (
          <div className="text-center text-gray-400 py-12 text-lg">No goals found. Start by adding a new goal!</div>
        )}
        {(goals || []).map(goal => {
          const saved = goal.savingsTotal || 0;
          const isExpanded = expandedGoalId === goal._id;
          return (
            <div key={goal._id} className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${isExpanded ? 'border-indigo-400' : 'border-gray-200'} p-6 hover:shadow-xl`}> 
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer" onClick={() => handleExpandGoal(goal._id)}>
                <div className="flex-1">
                  <div className="font-bold text-xl text-indigo-900 mb-2">{goal.title}</div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-gray-600">Target: <span className="font-semibold">₹{goal.targetAmount?.toLocaleString?.() ?? goal.targetAmount}</span></span>
                    <span className="text-gray-600">Saved: <span className="font-semibold text-indigo-700">₹{saved.toLocaleString?.() ?? saved}</span></span>
                    <span className="text-gray-600">Remaining: <span className="font-semibold text-indigo-700">₹{ goal.targetAmount - saved}</span></span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-gray-600">Priority: <span className="font-semibold">{goal.priority}</span></span>
                    <span className="text-gray-600">Dates: <span className="font-semibold">{goal.startDate ? goal.startDate.slice(0,10) : '-'} - {goal.endDate ? goal.endDate.slice(0,10) : '-'}</span></span>
                  </div>
                  <div className="mb-2">Notes: <span className="text-gray-500">{goal.notes || '-'}</span></div>
                  <div className="w-full max-w-md mb-2"><ProgressBar value={saved} max={goal.targetAmount} /></div>
                </div>
                <div className="flex gap-2 md:flex-col md:gap-3">
                  <button onClick={e => { e.stopPropagation(); setEditGoal(goal); }} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-2 px-4 rounded-lg shadow transition">Edit</button>
                  <button onClick={e => { e.stopPropagation(); if(window.confirm('Delete this goal?')) handleDeleteGoal(goal._id); }} className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg shadow transition">Delete</button>
                  <button onClick={e => { e.stopPropagation(); setSelectedGoal(goal); setShowSavingForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition">Add Saving</button>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-indigo-900">Savings History</h3>
                  <div className="max-h-56 overflow-y-auto rounded-xl shadow bg-white border border-gray-100">
                    {detailsSavings.length === 0 ? (
                      <div className="text-gray-500 py-6 text-center">No savings added yet.</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        <div className="sticky top-0 bg-white z-10 flex font-semibold text-gray-600 text-sm border-b">
                          <div className="w-1/4 py-3 px-4 flex items-center gap-2"><span className="material-icons text-indigo-400 text-base">Date</span></div>
                          <div className="w-1/4 py-3 px-4 flex items-center gap-2"><span className="material-icons text-green-400 text-base">Amount</span></div>
                          <div className="w-2/4 py-3 px-4 flex items-center gap-2"><span className="material-icons text-gray-400 text-base">Note</span></div>
                        </div>
                        {detailsSavings.map((s, idx) => (
                          <div key={s._id} className={`flex items-center text-sm ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} py-3 px-2`}>
                            <div className="w-1/4 px-4 flex items-center gap-2">
                              <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 text-xs font-bold">{s.date?.slice(0,10)}</span>
                            </div>
                            <div className="w-1/4 px-4 flex items-center gap-2">
                              <span className="inline-block bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs font-bold">+₹{s.amount?.toLocaleString?.() ?? s.amount}</span>
                            </div>
                            <div className="w-2/4 px-4 flex items-center gap-2">
                              {s.note ? (
                                <span className="inline-block bg-gray-100 text-gray-700 rounded px-2 py-1 text-xs">{s.note}</span>
                              ) : (
                                <span className="text-gray-400 italic">No note</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Edit Goal Modal */}
              {editGoal && (
                <GoalForm
                  onSave={async (data) => {
                    if (editGoal._id) {
                      await handleSaveGoal({ ...editGoal, ...data });
                    } else {
                      await handleAddGoal(data);
                    }
                    setEditGoal(null);
                    fetchGoals();
                  }}
                  onCancel={() => setEditGoal(null)}
                  initial={editGoal._id ? editGoal : undefined}
                />
              )}
              {/* Add Saving Modal */}
              {showSavingForm && selectedGoal && selectedGoal._id === goal._id && (
                <AddSavingForm
                  onSave={async (data) => {
                    await handleAddSaving(goal._id, data);
                    setShowSavingForm(false);
                    setSelectedGoal(null);
                    handleExpandGoal(goal._id); // refresh savings
                  }}
                  onCancel={() => { setShowSavingForm(false); setSelectedGoal(null); }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tailwind utility classes for buttons/inputs (should be in global CSS)
// .btn-primary { ... } .btn-secondary { ... } .btn-danger { ... } .input { ... } .modal { ... } .modal-content { ... }
