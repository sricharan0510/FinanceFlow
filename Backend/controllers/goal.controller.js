import Goal from '../models/goal.model.js';
import GoalSaving from '../models/goalSaving.model.js';

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    const goal = new Goal({ ...req.body, user: req.user._id });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all goals for a user (with filters)
export const getGoals = async (req, res) => {
  try {
    const { status, minAmount, maxAmount, priority, sortBy } = req.query;
    let filter = { user: req.user._id };
    if (priority) filter.priority = priority;
    if (minAmount || maxAmount) filter.targetAmount = {};
    if (minAmount) filter.targetAmount.$gte = Number(minAmount);
    if (maxAmount) filter.targetAmount.$lte = Number(maxAmount);
    if (status === 'active') filter.completed = false;
    if (status === 'completed') filter.completed = true;
    let query = Goal.find(filter);
    if (sortBy === 'deadline') query = query.sort({ endDate: 1 });
    if (sortBy === 'amountRemaining') query = query.sort({ targetAmount: 1 });
    // Add more sorting as needed
    const goals = await query.exec();

    // For each goal, calculate total savings
    const goalIds = goals.map(g => g._id);
    const savings = await GoalSaving.aggregate([
      { $match: { goal: { $in: goalIds } } },
      { $group: { _id: '$goal', total: { $sum: '$amount' } } }
    ]);
    const savingsMap = {};
    savings.forEach(s => { savingsMap[s._id.toString()] = s.total; });
    const goalsWithSavings = goals.map(g => {
      const obj = g.toObject();
      obj.savingsTotal = savingsMap[g._id.toString()] || 0;
      return obj;
    });
    res.json(goalsWithSavings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single goal
export const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a goal
export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    await GoalSaving.deleteMany({ goal: goal._id }); // Remove all savings for this goal
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add savings to a goal
export const addSaving = async (req, res) => {
  try {
    const { amount, date, note } = req.body;
    const goal = await Goal.findOne({ _id: req.params.goalId, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    const saving = new GoalSaving({
      goal: goal._id,
      user: req.user._id,
      amount,
      date,
      note,
    });
    await saving.save();
    res.status(201).json(saving);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get savings for a goal
export const getSavings = async (req, res) => {
  try {
    const savings = await GoalSaving.find({ goal: req.params.goalId, user: req.user._id }).sort({ date: 1 });
    res.json(savings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Dashboard summary
export const getGoalsSummary = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    const savings = await GoalSaving.find({ user: req.user._id });
    const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);
    const activeGoals = goals.filter(g => !g.completed).length;
    const completedGoals = goals.filter(g => g.completed).length;
    res.json({ totalSavings, activeGoals, completedGoals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
