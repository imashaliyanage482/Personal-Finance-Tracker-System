import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Default credentials for the user "Imasha Liyanage"
    if (email === 'imasha@fintrack.com' && password === '123456') {
      onLogin();
    } else {
      setError('Invalid email or password. (Hint: imasha@fintrack.com / 123456)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-600 shadow-lg shadow-indigo-500/30 mb-6">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Log in to manage your finances</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100 flex items-center justify-center text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="imasha@fintrack.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign In <ArrowRight size={20} />
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account? <button className="text-indigo-600 hover:text-indigo-700 font-bold ml-1">Sign up</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
