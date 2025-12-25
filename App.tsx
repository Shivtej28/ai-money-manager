
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/Login';
import Dashboard from './features/Dashboard';
import Transactions from './features/Transactions';
import Investments from './features/Investments';
import Loans from './features/Loans';
import Reports from './features/Reports';
import Settings from './features/Settings';
import Categories from './features/Categories';
import Banks from './features/Banks';
import { getAuthToken } from './lib/api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('zenmoney_token');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) return null; // Or a loader

  return (
    <HashRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/banks" element={<Banks />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;
