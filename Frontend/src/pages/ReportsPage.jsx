import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F', '#F9F871'];

export default function ReportsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [report, setReport] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const changeMonth = (delta) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev.getFullYear(), prev.getMonth(), 1);
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        setReport(null);
        setTransactions([]);
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const data = await apiService.generateMonthlyReport({ month, year });
            setReport(data.report);
            setTransactions(data.transactions);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = selectedCategory === "All"
        ? transactions
        : transactions.filter(t => t.category === selectedCategory);

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Monthly Financial Report", 14, 15);
        doc.text(`Month: ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 25);

        autoTable(doc, {
            head: [['Category', 'Amount']],
            body: report.topSpendingCategories.map(item => [item.category, `₹${item.amount}`]),
            startY: 35,
        });

        doc.text(`Income: ₹${report.income}`, 14, doc.lastAutoTable.finalY + 10);
        doc.text(`Expense: ₹${report.expense}`, 14, doc.lastAutoTable.finalY + 18);
        doc.text(`Net Savings: ₹${report.savings}`, 14, doc.lastAutoTable.finalY + 26);

        doc.save("Monthly_Report.pdf");
    };

    useEffect(() => {
        fetchReport();
    }, [currentDate]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Monthly Financial Summary</h1>

            {/* Month selector */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button onClick={() => changeMonth(-1)} className="text-xl px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">◀</button>
                    <span className="text-lg font-semibold text-gray-800">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => changeMonth(1)} className="text-xl px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">▶</button>
                </div>
                <button onClick={fetchReport} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">Refresh</button>
            </div>

            {report && report.monthlySummary && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-2">🧠 AI Monthly Summary</h2>
                    <p className="text-gray-700 mb-2">{report.monthlySummary}</p>
                    {report.actionableAdvice?.length > 0 && (
                        <ul className="list-disc list-inside text-gray-700">
                            {report.actionableAdvice.map((tip, idx) => (
                                <li key={idx}>💡 {tip}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}


            {error && <div className="text-red-500 font-medium">{error}</div>}
            {loading && <div className="text-gray-500">Loading report...</div>}

            {report && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-green-100 p-4 rounded-lg text-center">
                            <p className="text-gray-600">Total Income</p>
                            <p className="text-2xl font-bold text-green-700">₹{report.income}</p>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg text-center">
                            <p className="text-gray-600">Total Expense</p>
                            <p className="text-2xl font-bold text-red-700">₹{report.expense}</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg text-center">
                            <p className="text-gray-600">Net Savings</p>
                            <p className="text-2xl font-bold text-blue-700">₹{report.savings}</p>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending by Category</h2>
                        {report.topSpendingCategories.length === 0 ? (
                            <p className="text-gray-500">No data for chart.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={report.topSpendingCategories}
                                        dataKey="amount"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {report.topSpendingCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Filter & Table */}
                    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
                            <select
                                className="border rounded px-3 py-2 text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                {report.topSpendingCategories.map((cat, idx) => (
                                    <option key={idx} value={cat.category}>{cat.category}</option>
                                ))}
                            </select>
                        </div>
                        {filteredTransactions.length === 0 ? (
                            <p className="text-gray-500">No transactions in this category.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left border">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Description</th>
                                            <th className="px-4 py-2">Amount</th>
                                            <th className="px-4 py-2">Category</th>
                                            <th className="px-4 py-2">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map((t, index) => (
                                            <tr key={index} className="border-t">
                                                <td className="px-4 py-2">{new Date(t.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">{t.description}</td>
                                                <td className="px-4 py-2">₹{t.amount}</td>
                                                <td className="px-4 py-2">{t.category}</td>
                                                <td className="px-4 py-2 capitalize">{t.type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={downloadPDF}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Download Report as PDF
                    </button>
                </>
            )}
        </div>
    );
}
