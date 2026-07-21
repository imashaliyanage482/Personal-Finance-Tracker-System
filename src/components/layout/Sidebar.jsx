import React from 'react';
import { LayoutDashboard, Receipt, PieChart, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Receipt, label: 'Transactions', id: 'transactions' },
    { icon: PieChart, label: 'Analytics', id: 'analytics' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-500/20">
            F
          </div>
          <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-600">FinTrack</span>
        </div>

        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50 font-bold translate-x-1'
                    : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800 hover:translate-x-1 font-medium'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all duration-300 mt-auto cursor-pointer font-medium"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
