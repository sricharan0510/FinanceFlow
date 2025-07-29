import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { apiService } from '../services/apiService';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../services/categoryOptions';
// Transaction Modal (reused from TransactionsPage)
const TransactionModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [customCategory, setCustomCategory] = useState('');
    const [error, setError] = useState('');
    const categoryOptions = formData.type === 'income' ? INCOME_CATEGORIES : formData.type === 'expense' ? EXPENSE_CATEGORIES : [];
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'type') {
            setFormData(prev => ({ ...prev, type: value, category: '' }));
            setCustomCategory('');
        } else if (name === 'category') {
            setFormData(prev => ({ ...prev, category: value }));
            setCustomCategory('');
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleCustomCategory = (e) => {
        setCustomCategory(e.target.value);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.type) {
            setError('Please select a type.');
            return;
        }
        let categoryToSend = formData.category;
        if (formData.category === 'Other') {
            if (!customCategory.trim()) {
                setError('Please enter a custom category.');
                return;
            }
            categoryToSend = customCategory.trim();
        }
        if (formData.amount <= 0) {
            setError('Amount must be greater than zero.');
            return;
        }
        try {
            const payload = { ...formData, category: categoryToSend };
            await apiService.addTransaction(payload);
            onSave();
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white p-4 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Add Transaction</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Amount</label>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-lg" required>
                                <option value="" disabled>Select Type</option>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-lg" required disabled={!formData.type}>
                                <option value="" disabled>Select Category</option>
                                {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {formData.category === 'Other' && (
                                <input type="text" value={customCategory} onChange={handleCustomCategory} placeholder="Enter custom category" className="w-full p-2 border rounded-lg mt-2" required />
                            )}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Date</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                    </div>
                    {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
import { FaArrowUp, FaArrowDown, FaWallet, FaPlus, FaFileDownload, FaUserCircle, FaRegLightbulb } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const categoryIcons = {
    Home: <FaWallet className="text-indigo-500" />, 
    Transport: <FaArrowDown className="text-purple-500" />, 
    Food: <FaArrowUp className="text-pink-500" />, 
    Utilities: <FaArrowDown className="text-yellow-500" />, 
    LIC: <FaWallet className="text-green-500" />,
    Other: <FaWallet className="text-gray-400" />
};

const categoryColors = {
    Home: 'border-indigo-500',
    Transport: 'border-purple-500',
    Food: 'border-pink-500',
    Utilities: 'border-yellow-500',
    LIC: 'border-green-500',
    Other: 'border-gray-400',
};

const TransactionItem = ({ transaction }) => {
    const isExpense = transaction.type === 'expense';
    const icon = categoryIcons[transaction.category] || categoryIcons['Other'];
    const borderColor = categoryColors[transaction.category] || categoryColors['Other'];
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' });
    return (
        <div
            className={`flex items-center justify-between p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition border-l-4 ${borderColor} mb-2`}
        >
            <div className="flex items-center gap-4">
                <span className="text-2xl">{icon}</span>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 text-base">{transaction.description}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isExpense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{transaction.category}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formattedDate}</p>
                </div>
            </div>
            <span className={`font-bold text-base px-3 py-1 rounded-full ${isExpense ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-green-50 text-green-500 border border-green-200'}`}>{isExpense ? '-' : '+'}₹{transaction.amount.toLocaleString()}</span>
        </div>
    );
};

export default function DashboardPage() {
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState({ name: 'User', email: '', avatar: '' });
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            const [year, month] = selectedMonth.split('-');
            const [summaryData, transactionsData, userData] = await Promise.all([
                apiService.getDashboardSummary({ month, year }),
                apiService.getTransactions({ month, year }),
                apiService.getProfile ? apiService.getProfile() : Promise.resolve({ name: 'User', email: '', avatar: '' })
            ]);
            setSummary(summaryData);
            setTransactions(transactionsData);
            setUser(userData);
        } catch (err) {
            setError("Failed to fetch dashboard data. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line
    }, [selectedMonth]);
    // Download CSV logic (like TransactionsPage)
    const handleExportCSV = () => {
        const headers = ["Date", "Description", "Category", "Type", "Amount"];
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            '"' + t.description.replace(/"/g, '""') + '"',
            t.category,
            t.type,
            t.amount
        ]);
        let csvContent = '\uFEFF' + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenseTransactions.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    const doughnutData = {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6B7280'],
            borderColor: '#fff',
            borderWidth: 2,
        }]
    };

    // Income & Expense Trends (last 6 months, always from all transactions)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const trendLabels = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return months[d.getMonth()] + ' ' + d.getFullYear();
    });
    // Get all transactions for all months (not just selectedMonth)
    const [allTransactions, setAllTransactions] = useState([]);
    useEffect(() => {
        // Only fetch all transactions once on mount
        apiService.getTransactions({}).then(setAllTransactions).catch(() => {});
    }, []);
    const incomeTrends = Array(6).fill(0);
    const expenseTrends = Array(6).fill(0);
    allTransactions.forEach(t => {
        const tDate = new Date(t.date);
        const idx = 5 - (now.getMonth() - tDate.getMonth() + 12 * (now.getFullYear() - tDate.getFullYear()));
        if (idx >= 0 && idx < 6) {
            if (t.type === 'income') incomeTrends[idx] += t.amount;
            if (t.type === 'expense') expenseTrends[idx] += t.amount;
        }
    });
    const incomeLineData = {
        labels: trendLabels,
        datasets: [
            {
                label: 'Income',
                data: incomeTrends,
                fill: true,
                backgroundColor: 'rgba(16,185,129,0.1)',
                borderColor: '#10B981',
                tension: 0.4,
                pointBackgroundColor: '#10B981',
                pointRadius: 5,
            }
        ]
    };
    const expenseLineData = {
        labels: trendLabels,
        datasets: [
            {
                label: 'Expenses',
                data: expenseTrends,
                fill: true,
                backgroundColor: 'rgba(239,68,68,0.1)',
                borderColor: '#EF4444',
                tension: 0.4,
                pointBackgroundColor: '#EF4444',
                pointRadius: 5,
            }
        ]
    };

    if (loading) return <div className="text-center p-10 font-semibold text-gray-600">Loading Dashboard...</div>;
    if (error) return <div className="text-center p-10 font-semibold text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-2 sm:p-4 md:p-8">
            {/* User Greeting */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-indigo-400" />
                    ) : (
                        <FaUserCircle className="w-12 h-12 sm:w-14 sm:h-14 text-indigo-400" />
                    )}
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Welcome back, {user.name || 'User'}!</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Here's your financial overview at a glance.</p>
                    </div>
                </div>
                {/* Month Selector */}
                <div className="flex items-center gap-2">
                    <label htmlFor="month" className="text-gray-600 font-medium">Month:</label>
                    <input
                        id="month"
                        type="month"
                        className="border rounded-lg px-2 sm:px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        max={new Date().toISOString().slice(0, 7)}
                    />
                </div>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-200 to-green-100 p-4 sm:p-6 rounded-2xl shadow flex items-center gap-3 sm:gap-4">
                    <span className="bg-green-500 text-white p-2 sm:p-3 rounded-full text-xl sm:text-2xl"><FaArrowUp /></span>
                    <div>
                        <h3 className="text-green-800 font-bold text-sm sm:text-base">Total Income</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">₹{summary.totalIncome.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-red-200 to-red-100 p-4 sm:p-6 rounded-2xl shadow flex items-center gap-3 sm:gap-4">
                    <span className="bg-red-500 text-white p-2 sm:p-3 rounded-full text-xl sm:text-2xl"><FaArrowDown /></span>
                    <div>
                        <h3 className="text-red-800 font-bold text-sm sm:text-base">Total Expenses</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-red-600">₹{summary.totalExpense.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-blue-200 to-blue-100 p-4 sm:p-6 rounded-2xl shadow flex items-center gap-3 sm:gap-4">
                    <span className="bg-blue-500 text-white p-2 sm:p-3 rounded-full text-xl sm:text-2xl"><FaWallet /></span>
                    <div>
                        <h3 className="text-blue-800 font-bold text-sm sm:text-base">Balance</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600">₹{summary.balance.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-8">
                <button
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow transition w-full sm:w-auto justify-center"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaPlus /> Add Transaction
                </button>
                <button
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition w-full sm:w-auto justify-center"
                    onClick={handleExportCSV}
                >
                    <FaFileDownload /> Download Report
                </button>
            </div>
            {isModalOpen && (
                <TransactionModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => { setIsModalOpen(false); fetchDashboardData(); }}
                />
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-8">
                {/* Left: Recent Transactions & Trends */}
                <div className="lg:col-span-3 flex flex-col gap-4 md:gap-8">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">Recent Transactions</h2>
                        <div className="space-y-2">
                            {transactions.length > 0 
                                ? transactions.slice(0, 5).map(t => <TransactionItem key={t._id} transaction={t} />)
                                : <p className="text-gray-500">No recent transactions.</p>
                            }
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md w-full">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">Income & Expense Trends (Last 6 Months)</h2>
                        <div className="w-full h-64 sm:h-80">
                            <Line data={{
                                labels: trendLabels,
                                datasets: [
                                    {
                                        label: 'Income',
                                        data: incomeTrends,
                                        fill: true,
                                        backgroundColor: 'rgba(16,185,129,0.1)',
                                        borderColor: '#10B981',
                                        tension: 0.4,
                                        pointBackgroundColor: '#10B981',
                                        pointRadius: 5,
                                    },
                                    {
                                        label: 'Expenses',
                                        data: expenseTrends,
                                        fill: true,
                                        backgroundColor: 'rgba(239,68,68,0.1)',
                                        borderColor: '#EF4444',
                                        tension: 0.4,
                                        pointBackgroundColor: '#EF4444',
                                        pointRadius: 5,
                                    }
                                ]
                            }} options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: true, position: 'top' },
                                    tooltip: { callbacks: { label: ctx => `₹${ctx.parsed.y.toLocaleString()}` } }
                                },
                                scales: {
                                    y: { beginAtZero: true, ticks: { callback: v => `₹${v}` } }
                                }
                            }} />
                        </div>
                    </div>
                </div>
                {/* Right: Expense Breakdown & Tips */}
                <div className="lg:col-span-2 flex flex-col gap-4 md:gap-8">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md flex flex-col items-center">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">Expense Breakdown</h2>
                        <div className="w-48 h-48 sm:w-64 sm:h-64">
                            {expenseTransactions.length > 0 
                                ? <Doughnut data={doughnutData} options={{ 
                                    maintainAspectRatio: false, 
                                    plugins: { 
                                        legend: { position: 'bottom', labels: { boxWidth: 18, font: { size: 14 } } },
                                        tooltip: { callbacks: { label: ctx => `${ctx.label}: ₹${ctx.parsed.toLocaleString()} (${((ctx.parsed / expenseTransactions.reduce((a, b) => a + b.amount, 0)) * 100).toFixed(1)}%)` } }
                                    }
                                }} /> 
                                : <p className="text-gray-500 text-center mt-10">No expense data for this month.</p>
                            }
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-4 sm:p-6 rounded-2xl shadow flex items-center gap-3 sm:gap-4">
                        <span className="bg-yellow-400 text-white p-2 sm:p-3 rounded-full text-xl sm:text-2xl"><FaRegLightbulb /></span>
                        <div>
                            <h3 className="text-yellow-800 font-bold text-sm sm:text-base">Financial Tip</h3>
                            <p className="text-yellow-700 text-xs sm:text-sm">Track your expenses regularly and set monthly savings goals to improve your financial health!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
