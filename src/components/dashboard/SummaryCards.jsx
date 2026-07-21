import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const SummaryCards = ({ totalBalance, totalIncome, totalExpenses, currency }) => {
  const cards = [
    {
      title: 'Total Balance',
      amount: `${totalBalance < 0 ? '-' : ''}${currency} ${Math.abs(totalBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Net available funds',
      isPositive: totalBalance >= 0,
      icon: Wallet,
      color: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
      glow: 'group-hover:shadow-[0_4px_24px_rgba(99,102,241,0.15)]'
    },
    {
      title: 'Total Income',
      amount: `${currency} ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Gross earnings',
      isPositive: true,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      glow: 'group-hover:shadow-[0_4px_24px_rgba(16,185,129,0.15)]'
    },
    {
      title: 'Total Expenses',
      amount: `${currency} ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Accumulated spending',
      isPositive: false,
      icon: TrendingDown,
      color: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      glow: 'group-hover:shadow-[0_4px_24px_rgba(244,63,94,0.15)]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group shadow-sm ${card.glow}`}
          >
            {/* Subtle radial gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-slate-500 font-medium text-sm mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{card.amount}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color} ${card.border} border backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} strokeWidth={2} />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 relative z-10">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                card.title === 'Total Balance' 
                  ? (card.isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200')
                  : card.title === 'Total Income' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
                Active
              </span>
              <span className="text-slate-400 text-xs">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
