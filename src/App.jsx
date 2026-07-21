import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import SummaryCards from './components/dashboard/SummaryCards';
import MonthlyChart from './components/dashboard/MonthlyChart';
import TransactionList from './components/dashboard/TransactionList';
import AddEditTransactionModal from './components/dashboard/AddEditTransactionModal';
import AnalyticsView from './components/dashboard/AnalyticsView';
import SettingsView from './components/dashboard/SettingsView';
import Login from './components/auth/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState('Imasha Liyanage');
  const [currency, setCurrency] = useState('Rs.');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbConnected, setDbConnected] = useState(true);

  // Fetch DB Connection Status
  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbConnected(data.connected);
        return data.connected;
      }
      setDbConnected(false);
      return false;
    } catch {
      setDbConnected(false);
      return false;
    }
  };

  // Fetch Transactions and Settings
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isConnected = await checkDbStatus();
      if (!isConnected) {
        setError("Database is offline. Check your MongoDB connection.");
        setLoading(false);
        return;
      }

      // Parallel fetch settings and transactions
      const [txRes, settingsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/settings')
      ]);

      if (!txRes.ok || !settingsRes.ok) {
        throw new Error("Failed to load data from server");
      }

      const txData = await txRes.json();
      const settingsData = await settingsRes.json();

      setTransactions(txData);
      setUserName(settingsData.username || 'Imasha Liyanage');
      setCurrency(settingsData.currency || 'Rs.');
    } catch (err) {
      setError(err.message);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll DB status every 5 seconds to show real-time changes
    const interval = setInterval(checkDbStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Derived Calculations
  const totalIncome = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  // Handlers
  const handleSaveTransaction = async (tx) => {
    try {
      let url = '/api/transactions';
      let method = 'POST';

      if (editingTransaction) {
        url = `/api/transactions/${editingTransaction.id}`;
        method = 'PUT';
      }

      // Prepare payload (removing frontend-generated temporary ID if creating)
      const payload = { ...tx };
      if (!editingTransaction) {
        delete payload.id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save transaction');
      }

      await fetchData(); // reload fresh list
      setEditingTransaction(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete transaction');
      }
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleClearData = async () => {
    if (!window.confirm('CRITICAL WARNING: This will permanently delete all your transaction history from MongoDB. Proceed?')) return;
    try {
      const res = await fetch('/api/transactions/clear', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to clear database');
      setTransactions([]);
    } catch (err) {
      alert(err.message);
    }
  };


  const handleUpdateUserName = async (name) => {
    try {
      setUserName(name);
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCurrency = async (curr) => {
    try {
      setCurrency(curr);
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: curr })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Render Views dynamically based on active tab
  const renderContent = () => {
    if (loading && transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-lg animate-pulse">Connecting to MongoDB...</p>
        </div>
      );
    }

    if (error && !dbConnected) {
      return (
        <div className="bg-white/80 border border-red-200 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-4 shadow-xl shadow-red-500/5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500 border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Database Connection Offline</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            FinTrack could not establish a connection with MongoDB. Please verify that your MongoDB service is running locally or check the connection string in your <code>.env</code> file.
          </p>
          <button 
            onClick={fetchData}
            className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer mt-4"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="mb-2">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Ayubowan, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-600">{userName}</span>! 👋</h1>
              <p className="text-slate-500 mt-1">Here's a snapshot of your finances today.</p>
            </div>
            
            <SummaryCards 
              totalBalance={totalBalance} 
              totalIncome={totalIncome} 
              totalExpenses={totalExpenses} 
              currency={currency} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-full">
                <MonthlyChart transactions={transactions} currency={currency} />
              </div>
              <div className="lg:col-span-1 h-full">
                <TransactionList 
                  transactions={transactions} 
                  currency={currency} 
                  onEdit={handleEditClick} 
                  onDelete={handleDeleteTransaction} 
                  onAddClick={handleOpenAddModal}
                  viewMode="dashboard"
                  onViewAllClick={() => setActiveTab('transactions')}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </>
        );
      case 'transactions':
        return (
          <TransactionList 
            transactions={transactions} 
            currency={currency} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteTransaction} 
            onAddClick={handleOpenAddModal}
            viewMode="full"
            searchQuery={searchQuery}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView transactions={transactions} currency={currency} />
        );
      case 'settings':
        return (
          <SettingsView 
            userName={userName} 
            setUserName={handleUpdateUserName} 
            currency={currency} 
            setCurrency={handleUpdateCurrency} 
            onClearData={handleClearData} 
          />
        );
      default:
        return <div>Tab view not found</div>;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery} 
      userName={userName}
      dbConnected={dbConnected}
      onLogout={() => setIsLoggedIn(false)}
    >
      {renderContent()}

      <AddEditTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }} 
        onSave={handleSaveTransaction} 
        transaction={editingTransaction} 
        currency={currency}
      />
    </DashboardLayout>
  );
}

export default App;
