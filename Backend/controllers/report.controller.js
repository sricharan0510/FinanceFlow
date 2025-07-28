import { Transaction } from "../models/transaction.model.js";
import fetch from "node-fetch";

export const generateMonthlyReport = async (req, res) => {
    const { month, year } = req.body;
    const userId = req.user._id;

    if (!month || !year) {
        return res.status(400).json({ message: "Month and year are required." });
    }

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const transactions = await Transaction.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        });

        if (transactions.length === 0) {
            return res.status(404).json({ message: "No transactions for this month." });
        }

        let income = 0;
        let expense = 0;
        const categoryMap = {};

        const formattedTransactions = transactions.map((t) => {
            const dateStr = new Date(t.date).toLocaleDateString('en-IN');
            const typeLabel = t.type === 'income' ? 'earned' : 'spent';
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;

            if (!categoryMap[t.category]) categoryMap[t.category] = 0;
            categoryMap[t.category] += t.amount;

            return `- On ${dateStr}, you ${typeLabel} ₹${t.amount} for "${t.description}" (Category: ${t.category})`;
        }).join('\n');

        const topCategories = Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount
        })).sort((a, b) => b.amount - a.amount);

        const netSavings = income - expense;

        // 🌟 AI Prompt
        const prompt = `
Generate a monthly financial summary and saving advice in JSON using this format:
{
  "monthlySummary": "one-liner summary",
  "actionableAdvice": ["tip1", "tip2"]
}

Data:
Month: ${startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
Transactions:
${formattedTransactions}
        `.trim();

        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        let aiSummary = null;

        if (apiKey) {
            try {
                const aiRes = await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                    })
                });

                const aiData = await aiRes.json();
                const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText?.startsWith("{")) {
                    aiSummary = JSON.parse(rawText);
                }
            } catch (err) {
                console.error("Gemini AI Error:", err.message);
            }
        }

        return res.status(200).json({
            report: {
                income,
                expense,
                savings: netSavings,
                topSpendingCategories: topCategories,
                monthlySummary: aiSummary?.monthlySummary || "",
                actionableAdvice: aiSummary?.actionableAdvice || [],
            },
            transactions
        });

    } catch (err) {
        console.error("Report error:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};
