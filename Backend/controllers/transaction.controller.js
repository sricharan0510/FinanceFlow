import { Transaction } from "../models/transaction.model.js";
import mongoose from "mongoose";

// Unified getTransactions: supports month/year, type, category, dateFrom/dateTo
export const getTransactions = async (req, res) => {
  const { month, year, type, category, dateFrom, dateTo } = req.query;
  const query = { userId: req.user._id };

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    query.date = { $gte: startDate, $lte: endDate };
  } else if (dateFrom && dateTo) {
    query.date = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
  }

  if (type) query.type = type;
  if (category) query.category = category;

  try {
    const transactions = await Transaction.find(query).sort({ date: -1 });
    return res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

// Add a new transaction (income or expense)
export const addTransaction = async (req, res) => {
    const { description, amount, type, category, paymentMethod, date } = req.body;
    
    const transaction = await Transaction.create({
        userId: req.user._id,
        description,
        amount,
        type,
        category,
        paymentMethod,
        date: date ? new Date(date) : new Date(),
    });

    return res.status(201).json({ message: "Transaction added successfully", transaction });
};

// ...existing code...

// Update a transaction
export const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
    }
    
    return res.status(200).json({ message: "Transaction updated", transaction: updatedTransaction });
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    return res.status(200).json({ message: "Transaction deleted successfully" });
};

// Get Dashboard Summary
export const getDashboardSummary = async (req, res) => {
    const userId = req.user._id;
    let { month, year } = req.query;
    let startOfMonth, endOfMonth;
    if (month && year) {
        startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
        endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    } else {
        const now = new Date();
        startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const result = await Transaction.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: startOfMonth, $lte: endOfMonth },
            },
        },
        {
            $group: {
                _id: "$type",
                total: { $sum: "$amount" },
            },
        },
    ]);

    let summary = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        savingTarget: req.user.savingTarget
    };

    result.forEach(item => {
        if (item._id === 'income') summary.totalIncome = item.total;
        if (item._id === 'expense') summary.totalExpense = item.total;
    });

    summary.balance = summary.totalIncome - summary.totalExpense;

    res.status(200).json(summary);
};