import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, User as UserIcon, ArrowLeft, CheckCircle2, X, Sparkles } from 'lucide-react';

const Login = ({ onLogin, isModal = false, isOpen = true, onClose, promptMessage = '' }) => {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'success'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = '/api';

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModal && onClose) {
        onClose();
      }
    };
    if (isModal && isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModal, isOpen, onClose]);

  if (isModal && !isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (view === 'forgot') {
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Reset failed');
        
        setView('success');
        setTimeout(() => {
          setView('login');
          setPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 2000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login or Register flow
    try {
      const endpoint = view === 'register' ? '/auth/register' : '/auth/login';
      const payload = view === 'register' ? { name, email, password } : { email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Save token in storage
      sessionStorage.setItem('fintrack_token', data.token);
      localStorage.setItem('fintrack_token', data.token);
      
      // Tell parent App we are logged in
      if (onLogin) onLogin(data.user);
      if (onClose) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setView(view === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
  };

  const cardContent = (
    <div className="w-full max-w-md relative z-10">
      {/* Prompt Message if passed (e.g. "Sign in to add a transaction") */}
      {promptMessage && (
        <div className="mb-4 p-3.5 bg-indigo-50 border border-indigo-200/80 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-indigo-800 shadow-sm">
          <Sparkles size={18} className="shrink-0 text-indigo-600 mt-0.5" />
          <span className="font-semibold">{promptMessage}</span>
        </div>
      )}

      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-600 shadow-lg shadow-indigo-500/30 mb-4 transition-transform hover:scale-105">
          <ShieldCheck size={28} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-1.5">
          {view === 'login' ? 'Welcome to FinTrack' : view === 'forgot' ? 'Reset Password' : view === 'success' ? 'Password Reset!' : 'Create Account'}
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          {view === 'login' ? 'Sign in to access and manage your finances' : view === 'forgot' ? 'Create a new password for your account' : view === 'success' ? 'You can now log in' : 'Join FinTrack to take control of your money'}
        </p>
      </div>

      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/10 relative">
        {/* Close Button for Modal */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100 flex items-center justify-center text-center mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {view === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 ml-1">Full Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium text-sm"
                  placeholder="e.g. Alex Silva"
                  required={view === 'register'}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {(view === 'login' || view === 'register') && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium text-sm"
                    placeholder="••••••••"
                    maxLength={25}
                    required
                  />
                </div>
              </div>

              {view === 'login' && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-xs font-medium text-slate-600">Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { setView('forgot'); setError(''); }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </>
          )}

          {view === 'forgot' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium text-sm"
                    placeholder="••••••••"
                    maxLength={25}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 ml-1">Confirm New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium text-sm"
                    placeholder="••••••••"
                    maxLength={25}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {view !== 'success' && (
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {loading ? 'Please wait...' : view === 'login' ? 'Sign In' : view === 'forgot' ? 'Save New Password' : 'Create Account'} 
                {!loading && view !== 'forgot' && <ArrowRight size={18} />}
              </button>
              
              {view === 'forgot' && (
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              )}
            </div>
          )}
        </form>

        {view === 'success' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-slate-600 font-medium text-center">Your password has been successfully changed.</p>
          </div>
        )}

        {(view === 'login' || view === 'register') && (
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-slate-500">
              {view === 'login' ? "Don't have an account?" : "Already have an account?"} 
              <button 
                onClick={toggleView}
                className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition-colors cursor-pointer"
              >
                {view === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[100px]" />
      {cardContent}
    </div>
  );
};

export default Login;
