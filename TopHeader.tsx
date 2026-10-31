import React from 'react';
import { Menu, Plus, Calendar, Download, LogIn, LogOut, User as UserIcon, CloudCheck, Loader2 } from 'lucide-react';
import { CurrencyConfig, NavigationTab } from '../types';
import { User } from 'firebase/auth';

interface TopHeaderProps {
  currentTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  onOpenAddModal: () => void;
  currency: CurrencyConfig;
  onOpenCurrencySelect: () => void;
  onExportCSV: () => void;
  user: User | null;
  authLoading: boolean;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenAddModal,
  currency,
  onOpenCurrencySelect,
  onExportCSV,
  user,
  authLoading,
  onOpenAuthModal,
  onLogout,
}) => {
  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Financial Dashboard', subtitle: 'Overview & recent activity' };
      case 'transactions':
        return { title: 'All Transactions', subtitle: 'Search, filter and manage expenses' };
      case 'analytics':
        return { title: 'Spending Analytics', subtitle: 'Trends, category share & cashflow' };
      case 'budgets':
        return { title: 'Budgets & Goals', subtitle: 'Monthly category limits & savings' };
      case 'settings':
        return { title: 'Settings & Data', subtitle: 'Preferences, backups & currency' };
    }
  };

  const { title, subtitle } = getTabTitle(currentTab);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
      {/* Zone 1: Mobile toggle & Breadcrumb/Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {title}
            </h1>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Zone 2 & 3: Quick utilities, Auth & Primary CTA */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date indicator */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-medium text-slate-600">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Currency Selector Button */}
        <button
          onClick={onOpenCurrencySelect}
          title="Change currency"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <span className="font-mono text-purple-600 font-bold">{currency.symbol}</span>
          <span>{currency.code}</span>
        </button>

        {/* Quick CSV Export */}
        <button
          onClick={onExportCSV}
          title="Export CSV"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* User Auth Controls */}
        {authLoading ? (
          <div className="flex h-8 items-center px-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/80 px-2.5 py-1 text-xs text-purple-900 max-w-[150px] sm:max-w-[200px]"
              title={`Logged in as ${user.email}`}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white uppercase">
                {user.email ? user.email[0] : 'U'}
              </div>
              <span className="truncate font-medium hidden sm:inline">{user.email}</span>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Primary Add CTA button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-xs shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="whitespace-nowrap">Add Record</span>
        </button>
      </div>
    </header>
  );
};
