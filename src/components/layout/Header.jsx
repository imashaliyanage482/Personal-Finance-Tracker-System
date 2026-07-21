import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery, userName, activeTab }) => {
  const showSearch = activeTab === 'dashboard' || activeTab === 'transactions';

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center text-slate-800">
        <h1 className="text-2xl font-extrabold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-900 drop-shadow-sm">
          {activeTab}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {showSearch && (
          <div className="relative group w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm placeholder-slate-400"
            />
          </div>
        )}

        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center border border-indigo-200 shadow-sm">
            <User size={18} className="text-white" />
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-slate-800 leading-tight">{userName}</p>
            <p className="text-xs text-indigo-600 font-medium">Pro Member</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
