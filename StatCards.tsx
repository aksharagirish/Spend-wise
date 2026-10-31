import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, TrendingUp } from 'lucide-react';
import { CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/storage';

interface StatCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  currency: CurrencyConfig;
  thisMonthIncome: number;
  thisMonthExpense: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalBalance,
  totalIncome,
  totalExpenses,
  currency,
  thisMonthIncome,
  thisMonthExpense,
}) => {
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;
  const isPositiveBalance = totalBalance >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Balance Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Balance
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Wallet className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono tabular-nums ${
                isPositiveBalance ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(totalBalance, currency)}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className={`inline-flex items-center font-medium ${
                isPositiveBalance ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isPositiveBalance ? 'Healthy Surplus' : 'Negative Deficit'}
            </span>
            <span>· All-time cumulative</span>
          </p>
        </div>

        {/* Gradient accent hairline bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
      </div>

      {/* 2. Total Income Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Income
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowUpRight className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(totalIncome, currency)}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600 font-mono tabular-nums">
              {formatCurrency(thisMonthIncome, currency)}
            </span>
            <span>this month</span>
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      </div>

      {/* 3. Total Expenses Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Expenses
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <ArrowDownRight className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatCurrency(totalExpenses, currency)}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-rose-600 font-mono tabular-nums">
              {formatCurrency(thisMonthExpense, currency)}
            </span>
            <span>this month</span>
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
      </div>

      {/* 4. Savings Rate Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Savings Rate
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <PiggyBank className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
              {savingsRate}%
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              {savingsRate >= 20 ? 'Optimal' : 'Needs attention'}
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
      </div>
    </div>
  );
};
