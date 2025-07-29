

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../services/categoryOptions';

import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/apiService';

const TransactionRow = ({ transaction, onEdit, onDelete, rowClass }) => {
    const isExpense = transaction.type === 'expense';
    const formattedDate = new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const categoryColors = {
        Food: 'bg-yellow-100 text-yellow-800',
        Transport: 'bg-blue-100 text-blue-800',
        Shopping: 'bg-pink-100 text-pink-800',
        Utilities: 'bg-purple-100 text-purple-800',
        Health: 'bg-green-100 text-green-800',
        Education: 'bg-indigo-100 text-indigo-800',
        Salary: 'bg-green-50 text-green-700',
        Investment: 'bg-cyan-100 text-cyan-800',
        Other: 'bg-gray-100 text-gray-800',
    };
    const catClass = categoryColors[transaction.category] || 'bg-gray-100 text-gray-800';
    return (
        <tr className={`transition-colors group hover:bg-indigo-50 ${rowClass || ''}`}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formattedDate}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${catClass}`}>{transaction.category}</span>
            </td>
            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>{isExpense ? '-' : '+'}₹{transaction.amount.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-4">
                    <button onClick={onEdit} className="focus:outline-none" title="Edit Transaction"><EditIcon /></button>
                    <button onClick={onDelete} className="focus:outline-none" title="Delete Transaction"><DeleteIcon /></button>
                </div>
            </td>
        </tr>
    );
};
// ...existing code...

// --- Reusable Icons (No changes needed) ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-red-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const AscIcon = () => <span style={{ fontSize: '1rem', marginLeft: 2 }}>&#9650;</span>; // ▲
const DescIcon = () => <span style={{ fontSize: '1rem', marginLeft: 2 }}>&#9660;</span>; // ▼
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>;


// --- Reusable UI Components ---
const Card = ({ children, className }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}>
        {children}
    </div>
);

const SummaryCard = ({ title, amount, colorClass }) => (
    <div className={`p-5 rounded-lg ${colorClass.bg}`}>
        <h3 className={`text-sm font-medium ${colorClass.text}`}>{title}</h3>
        <p className={`text-2xl font-bold ${colorClass.main}`}>₹{amount.toLocaleString()}</p>
    </div>
);


// --- Main Transactions Page Component ---
export default function TransactionsPage() {
    // Search bar state
    const [searchText, setSearchText] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    // Date range filter
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    // Amount sort
    const [amountSort, setAmountSort] = useState(null); 
    // Pagination
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                let filters = { month, year };
                if (filterStartDate && filterEndDate) {
                    filters.dateFrom = filterStartDate;
                    filters.dateTo = filterEndDate;
                }
                const data = await apiService.getTransactions(filters);
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [currentDate, filterStartDate, filterEndDate]);

    // --- UPDATED: Memoized calculations now include filtering ---
    const monthlySummary = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') acc.income += t.amount;
            else acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [transactions]);



const availableCategories = useMemo(() => {
    // For filter dropdown: show all unique categories for selected type, or all if 'all'
    if (filterType === 'income') {
        const cats = new Set(transactions.filter(t => t.type === 'income').map(t => t.category));
        return ['all', ...INCOME_CATEGORIES.filter(c => cats.has(c)).concat([...cats].filter(c => !INCOME_CATEGORIES.includes(c)))];
    } else if (filterType === 'expense') {
        const cats = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
        return ['all', ...EXPENSE_CATEGORIES.filter(c => cats.has(c)).concat([...cats].filter(c => !EXPENSE_CATEGORIES.includes(c)))];
    } else {
        // 'all' type: show all categories
        const cats = new Set(transactions.map(t => t.category));
        return ['all', ...Array.from(cats)];
    }
}, [transactions, filterType]);

    // Filtering, sorting, and pagination
    const filteredTransactions = useMemo(() => {
        let arr = transactions
            .filter(t => filterType === 'all' || t.type === filterType)
            .filter(t => filterCategory === 'all' || t.category === filterCategory)
            .filter(t => t.description.toLowerCase().includes(searchText.toLowerCase()));
        // Date range filter (frontend, within current month)
        if (filterStartDate && filterEndDate) {
            const start = new Date(filterStartDate);
            const end = new Date(filterEndDate);
            arr = arr.filter(t => {
                const d = new Date(t.date);
                return d >= start && d <= end;
            });
        }
        if (amountSort === 'asc') arr = arr.slice().sort((a, b) => a.amount - b.amount);
        else if (amountSort === 'desc') arr = arr.slice().sort((a, b) => b.amount - a.amount);
        else arr = arr.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
        return arr;
    }, [transactions, filterType, filterCategory, amountSort, filterStartDate, filterEndDate, searchText]);
    // Export to CSV (with UTF-8 BOM and proper date formatting for Excel)
    const handleExportCSV = () => {
        const headers = ["Date", "Description", "Category", "Type", "Amount"];
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            '"' + t.description.replace(/"/g, '""') + '"',
            t.category,
            t.type,
            t.amount
        ]);
        // Add BOM for Excel compatibility
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

    // Pagination
    const pagedTransactions = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredTransactions.slice(start, start + rowsPerPage);
    }, [filteredTransactions, page, rowsPerPage]);
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage) || 1;

    // --- Handler Functions (Minor changes for re-fetch) ---
    const handleOpenModal = (transaction = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const triggerRefetch = () => {
        // Create a new Date object to force re-render and trigger useEffect
        setCurrentDate(new Date(currentDate));
    };

    const handleSave = () => {
        triggerRefetch();
        handleCloseModal();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await apiService.deleteTransaction(id);
                triggerRefetch();
            } catch (error) {
                console.error('Failed to delete transaction:', error);
                alert('Error deleting transaction.');
            }
        }
    };

    const changeMonth = (delta) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + delta, 1);
            return newDate;
        });
    };

    const clearFilters = () => {
        setFilterType('all');
        setFilterCategory('all');
    }

    // Date range filter handlers
    const handleDateFilter = (e) => {
        e.preventDefault();
        // If only from date is set, set to-date automatically
        if (filterStartDate && !filterEndDate) {
            const from = new Date(filterStartDate);
            const now = new Date();
            const isCurrentMonth = from.getFullYear() === now.getFullYear() && from.getMonth() === now.getMonth();
            if (isCurrentMonth) {
                setFilterEndDate(now.toISOString().split('T')[0]);
            } else {
                // Set to last day of selected month
                const endOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0);
                setFilterEndDate(endOfMonth.toISOString().split('T')[0]);
            }
        }
        setPage(1);
    };
    const clearDateFilter = () => {
        setFilterStartDate('');
        setFilterEndDate('');
        setPage(1);
    };

    // Rows per page handler
    const handleRowsPerPage = (e) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    };

    // Restrict calendar to current month
    const getMonthLimits = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const first = new Date(year, month, 1).toISOString().split('T')[0];
        const last = new Date(year, month + 1, 0).toISOString().split('T')[0];
        return { first, last };
    };
    const { first: minDate, last: maxDate } = getMonthLimits();

    // Amount sort handler
    function handleAmountSort() {
        setAmountSort(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
    }

    return (
        <>
            {/* Search and Export Bar */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between mb-4 gap-2 sm:gap-4">
                <input
                    type="text"
                    placeholder="Search by description..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <button
                    onClick={handleExportCSV}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
                >
                    Export CSV
                </button>
            </div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Transactions</h1>
                <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronLeftIcon /></button>
                    <span className="text-base sm:text-xl font-semibold text-gray-700 w-24 sm:w-36 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><ChevronRightIcon /></button>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center">
                    <PlusIcon /> Add Transaction
                </button>
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                <SummaryCard title="Income" amount={monthlySummary.income} colorClass={{ bg: 'bg-green-50', text: 'text-green-800', main: 'text-green-600' }} />
                <SummaryCard title="Expenses" amount={monthlySummary.expense} colorClass={{ bg: 'bg-red-50', text: 'text-red-800', main: 'text-red-600' }} />
                <SummaryCard title="Balance" amount={monthlySummary.income - monthlySummary.expense} colorClass={{ bg: 'bg-blue-50', text: 'text-blue-800', main: 'text-blue-600' }} />
            </div>

            {/* --- Filters, Date Range, Table, Pagination --- */}
            <Card>
                {/* Filter Bar */}
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4">
                    <div className='flex items-center gap-2'>
                        <FilterIcon />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">Filters</h3>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
                        <select value={filterType} onChange={e => { setFilterType(e.target.value); setFilterCategory('all'); }} className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full sm:w-auto">
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full sm:w-auto" disabled={filterType === 'all'}>
                            {availableCategories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
                        </select>
                        <button onClick={clearFilters} className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 w-full sm:w-auto">Clear Filters</button>
                    </div>
                </div>
                {/* Date Range Filter */}
                <form className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-4" onSubmit={handleDateFilter}>
                    <label className="text-xs sm:text-sm text-gray-700 flex flex-col sm:flex-row items-start sm:items-center">From:
                        <input type="date" value={filterStartDate} min={minDate} max={maxDate} onChange={e => setFilterStartDate(e.target.value)} className="mt-1 sm:mt-0 sm:ml-2 p-2 border border-gray-300 rounded-lg w-full sm:w-auto" />
                    </label>
                    <label className="text-xs sm:text-sm text-gray-700 flex flex-col sm:flex-row items-start sm:items-center">To:
                        <input type="date" value={filterEndDate} min={filterStartDate || minDate} max={maxDate} onChange={e => setFilterEndDate(e.target.value)} className="mt-1 sm:mt-0 sm:ml-2 p-2 border border-gray-300 rounded-lg w-full sm:w-auto" />
                    </label>
                    <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded-lg w-full sm:w-auto">Apply</button>
                    {(filterStartDate && filterEndDate) && <button type="button" onClick={clearDateFilter} className="text-indigo-600 ml-0 sm:ml-2 w-full sm:w-auto">Clear Date Filter</button>}
                </form>
                {/* Table */}
                <div className="w-full overflow-x-auto min-w-[320px]">
                    <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-2 sm:px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={handleAmountSort}>
                                    Amount
                                    {amountSort === 'asc' && <AscIcon />}
                                    {amountSort === 'desc' && <DescIcon />}
                                    {!amountSort && <span style={{ opacity: 0.3 }}><AscIcon /><DescIcon /></span>}
                                </th>
                                <th scope="col" className="relative px-2 sm:px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Loading...</td></tr>
                            ) : pagedTransactions.length > 0 ? (
                                pagedTransactions.map(t => (
                                    <TransactionRow key={t._id} transaction={t} onEdit={() => handleOpenModal(t)} onDelete={() => handleDelete(t._id)} />
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center p-8 text-gray-500">No transactions found for this period or filter.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between mt-4 gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm">Rows per page:</span>
                        <select value={rowsPerPage} onChange={handleRowsPerPage} className="p-1 border rounded">
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="p-2" style={{ opacity: page === 1 ? 0.5 : 1 }}><ChevronLeftIcon /></button>
                        <span className="text-xs sm:text-sm">Page {page} of {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-2" style={{ opacity: page === totalPages ? 0.5 : 1 }}><ChevronRightIcon /></button>
                    </div>
                </div>
            </Card>

            {isModalOpen && <TransactionModal transaction={editingTransaction} onClose={handleCloseModal} onSave={handleSave} />}
        </>
    );
}

// ...existing code...




// --- Transaction Modal Form Component ---
const TransactionModal = ({ transaction, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        type: transaction?.type || '',
        description: transaction?.description || '',
        amount: transaction?.amount || '',
        category: transaction?.category || '',
        date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: transaction?.paymentMethod || 'UPI',
    });
    const [customCategory, setCustomCategory] = useState('');
    const [error, setError] = useState('');

    // Category options based on type
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
            if (transaction) {
                await apiService.updateTransaction(transaction._id, payload);
            } else {
                await apiService.addTransaction(payload);
            }
            onSave();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white p-4 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{transaction ? 'Edit' : 'Add'} Transaction</h2>
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