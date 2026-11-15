import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, LogIn } from 'lucide-react';
import DashboardLayout from './components/layout/DashboardLayout';
import SummaryCards from './components/dashboard/SummaryCards';
import MonthlyChart from './components/dashboard/MonthlyChart';
import TransactionList from './components/dashboard/TransactionList';
import AddEditTransactionModal from './components/dashboard/AddEditTransactionModal';
import AnalyticsView from './components/dashboard/AnalyticsView';
import SettingsView from './components/dashboard/SettingsView';
import Login from './components/auth/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!(localStorage.getItem('fintrack_token') || sessionStorage.getItem('fintrack_token'))
  );
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState(() => (
    (localStorage.getItem('fintrack_token') || sessionStorage.getItem('fintrack_token'))
      ? ''
      : 'Guest'
  ));
  const [currency, setCurrency] = useState('Rs.');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('All');
  
  const [loading, setLoading] = useState(isLoggedIn);
  const [error, setError] = useState(null);
  const [dbConnected, setDbConnected] = useState(true);

  // Auth modal states for guest-to-user prompting
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Helper to open Auth modal with custom context message
  const handleOpenAuth = (prompt = 'Sign in or create an account to start managing your finances.', action = null) => {
    setAuthModalPrompt(prompt);
    setPendingAction(() => action);
    setIsAuthModalOpen(true);
  };

  // Guard function: requires login before performing an action
  const requireAuth = (callback, prompt = 'Sign in or create an account to use this feature.') => {
    if (!isLoggedIn) {
      handleOpenAuth(prompt, callback);
      return false;
    }
    if (callback) callback();
    return true;
  };

  // Helper to attach JWT token
  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('fintrack_token') || sessionStorage.getItem('fintrack_token');
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    return fetch(url, { ...options, headers });
  };

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
        setError("Unable to connect to server. Please try again in a moment.");
        setLoading(false);
        return;
      }

      // Parallel fetch settings and transactions
      const [txRes, settingsRes] = await Promise.all([
        fetchWithAuth('/api/transactions'),
        fetchWithAuth('/api/settings')
      ]);

      if (txRes.status === 401 || settingsRes.status === 401) {
        sessionStorage.removeItem('fintrack_token');
        localStorage.removeItem('fintrack_token');
        setIsLoggedIn(false);
        setTransactions([]);
        setUserName('Guest');
        setLoading(false);
        return;
      }

      if (!txRes.ok || !settingsRes.ok) {
        throw new Error("Failed to load data from server");
      }

      const txData = await txRes.json();
      const settingsData = await settingsRes.json();

      setTransactions(txData);
      setUserName(settingsData.username || '');
      setCurrency(settingsData.currency || 'Rs.');
    } catch (err) {
      setError(err.message);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      // Poll DB status every 5 seconds to show real-time changes
      const interval = setInterval(checkDbStatus, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Derived Calculations
  const currentYear = new Date().getFullYear().toString();
  const availableYears = [...new Set([
    currentYear,
    ...transactions.map(tx => new Date(tx.rawDate || tx.date).getFullYear().toString())
  ])].sort((a, b) => b - a);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredTransactions = transactions.filter(tx => {
    const d = new Date(tx.rawDate || tx.date);
    const txYear = d.getFullYear().toString();
    const txMonth = d.toLocaleString('default', { month: 'long' });
    
    if (selectedYear === 'All') return true;
    if (selectedYear !== txYear) return false;
    
    if (selectedMonth === 'All') return true;
    return txMonth === selectedMonth;
  });

  const totalIncome = filteredTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  // Smart Notifications Generator
  const generateNotifications = () => {
    if (!isLoggedIn) {
      return [];
    }

    const notifs = [];
    if (transactions.length === 0) return notifs;

    // Calculate overall balance
    const overallIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const overallExpense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const overallBalance = overallIncome - overallExpense;

    if (overallBalance < 5000) {
      notifs.push({
        id: 'low-balance',
        type: 'warning',
        title: 'Low Balance Warning',
        message: `Your total balance is running low (${currency} ${overallBalance.toLocaleString()}).`,
        time: 'Just now'
      });
    }

    // Check for recent large expenses (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLargeExpenses = transactions.filter(t => {
      const txDate = new Date(t.rawDate || t.date);
      return t.amount < -5000 && txDate >= sevenDaysAgo;
    });

    if (recentLargeExpenses.length > 0) {
      notifs.push({
        id: 'large-expense',
        type: 'alert',
        title: 'Large Expenses Detected',
        message: `You have ${recentLargeExpenses.length} expense(s) over ${currency} 5,000 in the last 7 days.`,
        time: 'Recent'
      });
    }

    // Check for recent income
    const recentIncome = transactions.filter(t => {
      const txDate = new Date(t.rawDate || t.date);
      return t.amount > 0 && txDate >= sevenDaysAgo;
    });

    if (recentIncome.length > 0) {
      notifs.push({
        id: 'recent-income',
        type: 'success',
        title: 'Income Received',
        message: `Awesome! You recorded ${recentIncome.length} income(s) in the last 7 days.`,
        time: 'Recent'
      });
    }

    return notifs;
  };

  const notifications = generateNotifications();

  // Handlers guarded with Auth
  const handleSaveTransaction = async (tx) => {
    if (!requireAuth(null, 'Sign in or create an account to save transactions.')) return;
    try {
      let url = '/api/transactions';
      let method = 'POST';

      if (editingTransaction) {
        url = `/api/transactions/${editingTransaction.id}`;
        method = 'PUT';
      }

      // Prepare payload
      const payload = { ...tx };
      if (!editingTransaction) {
        delete payload.id;
      }

      const res = await fetchWithAuth(url, {
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
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!requireAuth(null, 'Sign in or create an account to manage your transactions.')) return;
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetchWithAuth(`/api/transactions/${id}`, {
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
    if (!requireAuth(null, 'Sign in to edit your transactions.')) return;
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    if (!requireAuth(() => {
      setEditingTransaction(null);
      setIsModalOpen(true);
    }, 'Sign in or create an account to record your own transactions.')) {
      return;
    }
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleClearData = async () => {
    if (!requireAuth(null, 'Sign in to manage and clear your transactions history.')) return;
    if (!window.confirm('CRITICAL WARNING: This will permanently delete all your transaction history. Proceed?')) return;
    try {
      const res = await fetchWithAuth('/api/transactions/clear', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to clear data');
      setTransactions([]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateUserName = async (name) => {
    if (!requireAuth(null, 'Sign in to customize and save your profile name.')) return;
    try {
      setUserName(name);
      await fetchWithAuth('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCurrency = async (curr) => {
    if (!requireAuth(null, 'Sign in to customize your preferred currency.')) return;
    try {
      setCurrency(curr);
      await fetchWithAuth('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: curr })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProfile = async () => {
    if (!requireAuth(null, 'Sign in to manage your profile settings.')) return;
    if (!window.confirm('Are you sure you want to reset your profile? This will reset your name and currency preferences to default.')) return;
    try {
      setUserName('User');
      setCurrency('Rs.');
      await fetchWithAuth('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'User', currency: 'Rs.' })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Called when login or register is successful inside Login modal
  const handleLoginSuccess = async (user) => {
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
    if (user?.name) {
      setUserName(user.name);
    }
    await fetchData();
    // Execute pending action if any was queued (e.g. open Add Modal)
    if (pendingAction && typeof pendingAction === 'function') {
      const act = pendingAction;
      setPendingAction(null);
      act();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_token');
    setIsLoggedIn(false);
    setTransactions([]);
    setUserName('Guest');
    setCurrency('Rs.');
    setActiveTab('dashboard');
  };

  // Render Views dynamically based on active tab
  const renderContent = () => {
    if (loading && transactions.length === 0 && isLoggedIn) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-lg animate-pulse">Connecting to server...</p>
        </div>
      );
    }

    if (error && !dbConnected && isLoggedIn) {
      return (
        <div className="bg-white/80 border border-red-200 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-4 shadow-xl shadow-red-500/5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500 border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Connection Offline</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            FinTrack could not establish a connection with the server. Please check your internet connection or try refreshing the page.
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
            {/* Guest Banner if not logged in */}
            {!isLoggedIn && (
              <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-200/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800">Welcome to FinTrack</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">Guest Mode</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Explore the dashboard and features freely. Sign in or create a free account to start tracking your finances!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenAuth('Sign in or create an account to start tracking your finances.')}
                  className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn size={16} />
                  <span>Sign In / Get Started</span>
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-600">{userName || 'Guest'}</span>! 👋
                </h1>
                <p className="text-slate-500 mt-1 text-sm sm:text-base">
                  Here's a snapshot of your finances for <span className="font-semibold text-slate-700">
                    {selectedYear === 'All' ? 'all time' : (selectedMonth === 'All' ? selectedYear : `${selectedMonth} ${selectedYear}`)}
                  </span>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Add Transaction Button right on Dashboard */}
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Transaction</span>
                </button>

                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-slate-200/60 p-1 rounded-2xl shadow-sm">
                  {/* Year Selector */}
                  <select 
                    value={selectedYear} 
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      if (e.target.value === 'All') setSelectedMonth('All');
                    }}
                    className="bg-white border border-slate-200/80 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl py-2 px-3 pr-7 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .5rem top 50%', backgroundSize: '.65rem auto' }}
                  >
                    <option value="All">All Years</option>
                    {availableYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  {/* Month Selector */}
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    disabled={selectedYear === 'All'}
                    className={`bg-white border border-slate-200/80 font-semibold text-xs sm:text-sm rounded-xl py-2 px-3 pr-7 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors shadow-sm appearance-none ${selectedYear === 'All' ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-800 cursor-pointer hover:bg-slate-50'}`}
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .5rem top 50%', backgroundSize: '.65rem auto' }}
                  >
                    <option value="All">All Months</option>
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <SummaryCards 
              totalBalance={totalBalance} 
              totalIncome={totalIncome} 
              totalExpenses={totalExpenses} 
              currency={currency} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-full">
                <MonthlyChart transactions={filteredTransactions} currency={currency} />
              </div>
              <div className="lg:col-span-1 h-full">
                <TransactionList 
                  transactions={filteredTransactions} 
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
          <>
            {!isLoggedIn && (
              <div className="bg-indigo-50/80 border border-indigo-200/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-700">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-indigo-600 shrink-0" />
                  <p className="text-xs sm:text-sm font-medium">
                    You are in guest preview. Sign in to add, edit, and keep track of your actual transactions.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAuth('Sign in or create an account to start adding transactions.')}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
            <TransactionList 
              transactions={transactions} 
              currency={currency} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteTransaction} 
              onAddClick={handleOpenAddModal}
              viewMode="full"
              searchQuery={searchQuery}
            />
          </>
        );
      case 'analytics':
        return (
          <>
            {!isLoggedIn && (
              <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-700">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-xs sm:text-sm font-medium">
                    Connect your account and add transactions to see your real-time analytics.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAuth('Sign in or create an account to track your finances with smart analytics.')}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all shrink-0 cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
            <AnalyticsView transactions={transactions} currency={currency} />
          </>
        );
      case 'settings':
        return (
          <>
            {!isLoggedIn && (
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-700">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-amber-600 shrink-0" />
                  <p className="text-xs sm:text-sm font-medium">
                    Settings preferences are preview-only until you sign in to your personal FinTrack account.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAuth('Sign in or create an account to customize your profile and settings.')}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shrink-0 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
            <SettingsView 
              userName={userName} 
              setUserName={handleUpdateUserName} 
              currency={currency} 
              setCurrency={handleUpdateCurrency} 
              onClearData={handleClearData}
              onDeleteProfile={handleDeleteProfile}
            />
          </>
        );
      default:
        return <div>Tab view not found</div>;
    }
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery} 
      userName={userName}
      dbConnected={dbConnected}
      isLoggedIn={isLoggedIn}
      onOpenAuth={() => handleOpenAuth()}
      onLogout={handleLogout}
      notifications={notifications}
    >
      {renderContent()}

      {/* Add / Edit Transaction Modal */}
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

      {/* Login & Register Modal for Guest conversion */}
      <Login 
        isModal={true}
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onLogin={handleLoginSuccess}
        promptMessage={authModalPrompt}
      />
    </DashboardLayout>
  );
}

export default App;
