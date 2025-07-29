import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// --- Reusable Icons ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const TransactionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const BudgetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6c0-2.21 3.582-4 8-4s8 1.79 8 4v8c0 2.21-3.582 4-8 4z" /></svg>;
const SubscriptionsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const GoalsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.418 0-8-1.79-8-4V6c0-2.21 3.582-4 8-4s8 1.79 8 4v8c0 2.21-3.582 4-8 4z" /></svg>;
const AIIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const TaxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

const NavLink = ({ to, icon, text, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center px-4 py-3 text-gray-200 hover:bg-indigo-700 rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-700' : ''}`}
        >
            {icon}
            <span className="ml-4 font-semibold">{text}</span>
        </Link>
    );
};

export default function MainLayout({ children, onLogout }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Sidebar content for reuse
    const SidebarContent = ({ onLinkClick }) => (
        <>
            <div className="text-2xl font-bold mb-10 px-4 mt-4">FinanceFlow</div>
            <nav className="flex-grow space-y-2">
                <NavLink to="/dashboard" icon={<DashboardIcon />} text="Dashboard" onClick={onLinkClick} />
                <NavLink to="/transactions" icon={<TransactionsIcon />} text="Transactions" onClick={onLinkClick} />
                <NavLink to="/budgets" icon={<BudgetIcon />} text="Budgets" onClick={onLinkClick} />
                <NavLink to="/subscriptions" icon={<SubscriptionsIcon />} text="Subscriptions" onClick={onLinkClick} />
                <NavLink to="/goals" icon={<GoalsIcon />} text="Goals & Savings" onClick={onLinkClick} />
                <NavLink to="/ai-insights" icon={<AIIcon />} text="AI Insights" onClick={onLinkClick} />
                {/* <NavLink to="/receipt-scanner" icon={<ReceiptIcon />} text="Receipt Scanner" onClick={onLinkClick} />
                <NavLink to="/tax-estimator" icon={<TaxIcon />} text="Tax Estimator" onClick={onLinkClick} /> */}
                {/* <NavLink to="/reports" icon={<ReportsIcon />} text="AI Reports" onClick={onLinkClick} /> */}
            </nav>
            <div>
                <div className="border-t border-indigo-700 mb-4"></div>
                <div className="px-4 py-2">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-indigo-300">{user?.email}</p>
                </div>
                <button onClick={onLogout} className="w-full flex items-center px-4 py-3 text-gray-200 hover:bg-indigo-700 rounded-lg transition-colors duration-200">
                    <LogoutIcon />
                    <span className="ml-4 font-semibold">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Mobile sidebar overlay */}
            <div className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
            {/* Sidebar for desktop */}
            <div className="w-64 bg-indigo-800 text-white flex-col p-4 hidden md:flex h-full">
                <SidebarContent />
            </div>
            {/* Sidebar for mobile */}
            <div className={`fixed top-0 left-0 z-50 w-64 h-full bg-indigo-800 text-white flex-col p-4 transform transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">&times;</button>
                <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
            </div>
            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Top bar for mobile */}
                <div className="flex items-center justify-between bg-indigo-800 text-white px-4 py-3 md:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="text-2xl" aria-label="Open sidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <span className="text-xl font-bold">FinanceFlow</span>
                    <button onClick={onLogout} className="flex items-center text-gray-200 hover:text-white">
                        <LogoutIcon />
                    </button>
                </div>
                <main className="flex-1 flex flex-col p-2 sm:p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
