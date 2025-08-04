import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import GoalsPage from './pages/GoalsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import MainLayout from './layouts/MainLayout';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

  const handleLoginSuccess = (data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!isAuthenticated ? <HomePage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <AuthPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/dashboard"
          element={isAuthenticated ? <MainLayout onLogout={handleLogout}><DashboardPage /></MainLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions"
          element={isAuthenticated ? <MainLayout onLogout={handleLogout}><TransactionsPage /></MainLayout> : <Navigate to="/login" />}
        />

        <Route
          path="/budgets"
          element={isAuthenticated ? <MainLayout onLogout={handleLogout}><BudgetsPage /></MainLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/subscriptions"
          element={isAuthenticated ? <MainLayout onLogout={handleLogout}><SubscriptionsPage /></MainLayout> : <Navigate to="/login" />}
        />


        <Route
          path="/goals"
          element={isAuthenticated ? <MainLayout onLogout={handleLogout}><GoalsPage /></MainLayout> : <Navigate to="/login" />}
        />

        <Route
          path="/ai-insights"
          element={isAuthenticated ? <MainLayout onLogout={handleLogout}><AIInsightsPage /></MainLayout> : <Navigate to="/login" />}
        />

        {/* Default route */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}