import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  Target,
  Settings,
  Plus,
  WalletCards,
  X,
  TrendingDown,
  TrendingUp,
  Cloud,
  CloudOff,
  UserCheck,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { User } from 'firebase/auth';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  monthlyIncome: number;
  monthlyExpense: number;
  currencySymbol: string;
  user: User | null;
  onOpenAuthModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  isOpenMobile,
  onCloseMobile,
  monthlyIncome,
  monthlyExpense,
  currencySymbol,
  user,
  onOpenAuthModal,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets & Goals', icon: Target },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const netSavings = monthlyIncome - monthlyExpense;
  const savingsPercent = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/90 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* App Logo & Brand */}
        <div className="flex h-18 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20">
              <WalletCards className="h-5 w-5" />
            </div>
            <div>
              <span className="block font-bold text-lg tracking-tight text-slate-900 leading-tight">
                Spend<span className="text-purple-600">Wise</span>
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                Smart Expense Tracker
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary CTA Button */}
        <div className="p-4 pb-2">
          <button
            onClick={() => {
              onOpenAddModal();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition-all hover:opacity-95 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-purple-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Monthly Snapshot Mini Widget */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">This Month</span>
              <span className="text-[11px] font-semibold text-purple-600">
                {savingsPercent >= 0 ? `${savingsPercent}% Saved` : 'Deficit'}
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-emerald-50/70 p-2">
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <TrendingUp className="h-3 w-3" /> Income
                </span>
                <span className="mt-0.5 block font-mono font-semibold tabular-nums text-slate-800">
                  {currencySymbol}{monthlyIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="rounded-lg bg-rose-50/70 p-2">
                <span className="flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                  <TrendingDown className="h-3 w-3" /> Expenses
                </span>
                <span className="mt-0.5 block font-mono font-semibold tabular-nums text-slate-800">
                  {currencySymbol}{monthlyExpense.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Cloud Sync State */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            {user ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Cloud className="h-3.5 w-3.5 text-emerald-500" />
                <span>Firestore Synced</span>
              </span>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 text-purple-600 font-medium hover:underline"
              >
                <CloudOff className="h-3.5 w-3.5 text-purple-500" />
                <span>Sync with Cloud</span>
              </button>
            )}
            <span className="font-mono text-[10px]">SpendWise v1.2</span>
          </div>
        </div>
      </aside>
    </>
  );
};
