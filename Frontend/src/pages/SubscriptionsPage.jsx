import React, { useEffect, useState, useMemo } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import SubscriptionCard from '../components/SubscriptionCard';

const Card = ({ children, className }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${className || ''}`}>
        {children}
    </div>
);

const initialForm = {
    name: '',
    amount: '',
    billingDate: '',
    frequency: 'monthly',
    status: 'active',
};

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('next');
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [freqFilter, setFreqFilter] = useState('all');

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const data = await subscriptionService.getSubscriptions();
            setSubscriptions(data);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // Memoized filtered and sorted subscriptions
    const filteredSubscriptions = useMemo(() => {
        let subs = [...subscriptions];
        if (filter !== 'all') subs = subs.filter(s => s.status === filter);
        if (freqFilter !== 'all') subs = subs.filter(s => s.frequency === freqFilter);
        if (searchText.trim()) subs = subs.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()));
        if (sort === 'next') subs.sort((a, b) => new Date(a.billingDate) - new Date(b.billingDate));
        else if (sort === 'amount') subs.sort((a, b) => b.amount - a.amount);
        return subs;
    }, [subscriptions, filter, sort, searchText, freqFilter]);

    // Pagination
    const pagedSubscriptions = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filteredSubscriptions.slice(start, start + rowsPerPage);
    }, [filteredSubscriptions, page, rowsPerPage]);
    const totalPages = Math.ceil(filteredSubscriptions.length / rowsPerPage) || 1;

    // Total spend summary
    const totalAmount = useMemo(() => filteredSubscriptions.reduce((sum, s) => sum + Number(s.amount), 0), [filteredSubscriptions]);

    // Export to CSV
    const handleExportCSV = () => {
        const headers = ['Name', 'Amount', 'Billing Date', 'Frequency', 'Status'];
        const rows = filteredSubscriptions.map(s => [
            '"' + s.name.replace(/"/g, '""') + '"',
            s.amount,
            new Date(s.billingDate).toLocaleDateString('en-GB'),
            s.frequency,
            s.status
        ]);
        let csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subscriptions.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Find the next upcoming subscription
    const nextSubscription = useMemo(() => {
        const now = new Date();
        return subscriptions
            .filter(s => new Date(s.billingDate) >= now && s.status === 'active')
            .sort((a, b) => new Date(a.billingDate) - new Date(b.billingDate))[0];
    }, [subscriptions]);

    const handleInput = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) {
                await subscriptionService.updateSubscription(editId, form);
            } else {
                await subscriptionService.createSubscription(form);
            }
            setShowForm(false);
            setForm(initialForm);
            setEditId(null);
            fetchSubscriptions();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (sub) => {
        setForm({
            name: sub.name,
            amount: sub.amount,
            billingDate: sub.billingDate.split('T')[0],
            frequency: sub.frequency,
            status: sub.status,
        });
        setEditId(sub._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subscription?')) return;
        try {
            await subscriptionService.deleteSubscription(id);
            fetchSubscriptions();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col gap-6 px-2 md:px-8 py-6 w-full">
            {/* Search and Export Bar */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchText}
                    onChange={e => { setSearchText(e.target.value); setPage(1); }}
                    className="p-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <button
                    onClick={handleExportCSV}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm hover:shadow-md"
                >
                    Export CSV
                </button>
            </div>
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800">Subscriptions</h1>
                <button onClick={() => { setShowForm(true); setForm(initialForm); setEditId(null); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm hover:shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Subscription
                </button>
            </div>
            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                <div className="p-5 rounded-lg bg-blue-50">
                    <h3 className="text-sm font-medium text-blue-800">Total Subscriptions</h3>
                    <p className="text-2xl font-bold text-blue-600">{filteredSubscriptions.length}</p>
                </div>
                <div className="p-5 rounded-lg bg-indigo-50">
                    <h3 className="text-sm font-medium text-indigo-800">Total Amount</h3>
                    <p className="text-2xl font-bold text-indigo-600">₹{totalAmount.toLocaleString()}</p>
                </div>
            </div>
            {/* Next Billing Reminder */}
            {nextSubscription && (
                <div className="mb-2 p-3 bg-indigo-50 border-l-4 border-indigo-400 text-indigo-900 rounded">
                    <strong>Next Billing:</strong> {nextSubscription.name} on {new Date(nextSubscription.billingDate).toLocaleDateString()} (₹{nextSubscription.amount})
                </div>
            )}
            {/* Filters */}
            <Card className="mb-2">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
                        <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select value={freqFilter} onChange={e => { setFreqFilter(e.target.value); setPage(1); }} className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                            <option value="all">All Frequencies</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="weekly">Weekly</option>
                            <option value="custom">Custom</option>
                        </select>
                        <select value={sort} onChange={e => setSort(e.target.value)} className="p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                            <option value="next">Sort by Next Billing</option>
                            <option value="amount">Sort by Amount</option>
                        </select>
                    </div>
                </div>
            </Card>
            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">{editId ? 'Edit' : 'Add'} Subscription</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Name</label>
                                <input name="name" value={form.name} onChange={handleInput} required className="w-full p-2 border rounded-lg" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Amount (₹)</label>
                                <input name="amount" type="number" value={form.amount} onChange={handleInput} required className="w-full p-2 border rounded-lg" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Billing Date</label>
                                <input name="billingDate" type="date" value={form.billingDate} onChange={handleInput} required className="w-full p-2 border rounded-lg" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Frequency</label>
                                <select name="frequency" value={form.frequency} onChange={handleInput} className="w-full p-2 border rounded-lg">
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Status</label>
                                <select name="status" value={form.status} onChange={handleInput} className="w-full p-2 border rounded-lg">
                                    <option value="active">Active</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            {error && <div className="text-red-600 mb-4 text-sm">{error}</div>}
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => { setShowForm(false); setForm(initialForm); setEditId(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">{editId ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Subscription List */}
            <Card>
                {loading ? <div className="text-center p-8 text-gray-500">Loading...</div> : (
                    filteredSubscriptions.length === 0 ? <div className="text-center p-8 text-gray-500">No subscriptions found.</div> :
                    <>
                        {pagedSubscriptions.map(sub => (
                            <SubscriptionCard
                                key={sub._id}
                                subscription={sub}
                                onEdit={() => handleEdit(sub)}
                                onDelete={() => handleDelete(sub._id)}
                            />
                        ))}
                        {/* Pagination */}
                        <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Rows per page:</span>
                                <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }} className="p-1 border rounded">
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="p-2" style={{ opacity: page === 1 ? 0.5 : 1 }}>&lt;</button>
                                <span className="text-sm">Page {page} of {totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-2" style={{ opacity: page === totalPages ? 0.5 : 1 }}>&gt;</button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
