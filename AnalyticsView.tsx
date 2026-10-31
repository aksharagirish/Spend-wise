import React, { useMemo } from 'react';
import { Category, CurrencyConfig, Transaction } from '../types';
import { formatCurrency } from '../utils/storage';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
  currency,
}) => {
  // Aggregate stats
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catExpenseMap: Record<string, number> = {};
    const catIncomeMap: Record<string, number> = {};
    const paymentMap: Record<string, number> = {};
    const dayOfWeekMap: Record<string, number> = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
        catIncomeMap[tx.category] = (catIncomeMap[tx.category] || 0) + tx.amount;
      } else {
        expense += tx.amount;
        catExpenseMap[tx.category] = (catExpenseMap[tx.category] || 0) + tx.amount;
        paymentMap[tx.paymentMethod] = (paymentMap[tx.paymentMethod] || 0) + tx.amount;

        const d = new Date(tx.date + 'T00:00:00');
        const dayName = days[d.getDay()];
        dayOfWeekMap[dayName] = (dayOfWeekMap[dayName] || 0) + tx.amount;
      }
    });

    const net = income - expense;
    const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : '0';
    const expenseTxCount = transactions.filter((t) => t.type === 'expense').length;
    const avgExpense = expenseTxCount > 0 ? expense / expenseTxCount : 0;

    // Sort top expense categories
    const sortedExpenseCats = Object.entries(catExpenseMap)
      .map(([name, amount]) => {
        const cat = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          amount,
          color: cat?.color || '#94A3B8',
          icon: cat?.icon || 'Tag',
          percent: expense > 0 ? (amount / expense) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      income,
      expense,
      net,
      savingsRate,
      avgExpense,
      sortedExpenseCats,
      paymentMap,
      dayOfWeekMap,
    };
  }, [transactions, categories]);

  return (
    <div className="space-y-6">
      {/* 3 Metric Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Cumulative Inflow</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(stats.income, currency)}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">All registered income</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Cumulative Outflow</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <ArrowDownRight className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(stats.expense, currency)}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">All registered expenses</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Average Expense Size</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(stats.avgExpense, currency)}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Per logged transaction</span>
        </div>
      </div>

      {/* Main Grid: Category Ranking + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown list with progress bars */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Top Spending Categories</h3>
              <p className="text-xs text-slate-500">Expenditure share across all recorded history</p>
            </div>
            <PieChart className="h-5 w-5 text-purple-600" />
          </div>

          <div className="mt-4 space-y-3.5">
            {stats.sortedExpenseCats.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No expenses recorded</p>
            ) : (
              stats.sortedExpenseCats.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white text-[10px]"
                        style={{ backgroundColor: cat.color }}
                      >
                        {getCategoryIcon(cat.icon, 'w-3 h-3')}
                      </span>
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(cat.amount, currency)}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({cat.percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.percent}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods and Spending Days */}
        <div className="space-y-6">
          {/* Payment Method Distribution */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Payment Method Breakdown</h3>
                <p className="text-xs text-slate-500">Where outflows are charged</p>
              </div>
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { key: 'card', label: 'Credit/Debit Card' },
                { key: 'bank', label: 'Bank Transfer' },
                { key: 'wallet', label: 'Digital Wallet' },
                { key: 'cash', label: 'Cash' },
              ].map((m) => {
                const amount = stats.paymentMap[m.key] || 0;
                const percent = stats.expense > 0 ? Math.round((amount / stats.expense) * 100) : 0;
                return (
                  <div key={m.key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-xs font-medium text-slate-600">{m.label}</span>
                    <p className="mt-1 font-mono font-bold text-slate-900 tabular-nums text-sm">
                      {formatCurrency(amount, currency)}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{percent}% of expenses</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day of Week Spending Heat */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Spending by Day of Week</h3>
                <p className="text-xs text-slate-500">Distribution over days</p>
              </div>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                const daySpent = stats.dayOfWeekMap[day] || 0;
                const maxDay = Math.max(...Object.values(stats.dayOfWeekMap), 1);
                const heightPercent = Math.max(10, Math.round((daySpent / maxDay) * 100));

                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <div className="h-20 w-full flex items-end justify-center rounded-lg bg-slate-50 p-1">
                      <div
                        className="w-full rounded-sm bg-gradient-to-t from-purple-600 to-indigo-500 transition-all"
                        style={{ height: `${heightPercent}%` }}
                        title={`${day}: ${formatCurrency(daySpent, currency)}`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{day}</span>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {daySpent > 0 ? `${currency.symbol}${Math.round(daySpent)}` : '0'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
