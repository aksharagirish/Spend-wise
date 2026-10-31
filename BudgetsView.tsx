import React, { useState } from 'react';
import { Category, CurrencyConfig, Transaction } from '../types';
import { formatCurrency } from '../utils/storage';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  Target,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Save,
  X,
  TrendingUp,
} from 'lucide-react';

interface BudgetsViewProps {
  categories: Category[];
  transactions: Transaction[];
  currency: CurrencyConfig;
  onUpdateCategoryBudget: (categoryId: string, newBudget: number) => void;
  onOpenAddModal: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  transactions,
  currency,
  onUpdateCategoryBudget,
  onOpenAddModal,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBudgetValue, setEditBudgetValue] = useState<string>('');

  // Current month transactions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'expense';
  });

  // Calculate spending per expense category
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const budgetStats = expenseCategories.map((cat) => {
    const spent = currentMonthTransactions
      .filter((t) => t.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((acc, t) => acc + t.amount, 0);

    const budget = cat.monthlyBudget || 300;
    const remaining = budget - spent;
    const percent = Math.min(200, Math.round((spent / budget) * 100));

    return {
      category: cat,
      spent,
      budget,
      remaining,
      percent,
      isExceeded: spent > budget,
      isWarning: spent >= budget * 0.8 && spent <= budget,
    };
  });

  const totalMonthlyBudget = budgetStats.reduce((acc, b) => acc + b.budget, 0);
  const totalMonthlySpent = budgetStats.reduce((acc, b) => acc + b.spent, 0);
  const overallPercent =
    totalMonthlyBudget > 0 ? Math.round((totalMonthlySpent / totalMonthlyBudget) * 100) : 0;

  const handleStartEdit = (catId: string, currentBudget: number) => {
    setEditingId(catId);
    setEditBudgetValue(currentBudget.toString());
  };

  const handleSaveEdit = (catId: string) => {
    const val = parseFloat(editBudgetValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateCategoryBudget(catId, val);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Target className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Monthly Budget Goals</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track category limits, prevent overspending, and manage monthly caps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors"
            >
              + Log Expense
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs font-medium text-slate-500">Total Monthly Budget</span>
            <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(totalMonthlyBudget, currency)}
            </p>
          </div>

          <div className="rounded-xl bg-purple-50/60 p-4 border border-purple-100">
            <span className="text-xs font-medium text-purple-700">Spent This Month</span>
            <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-purple-900">
              {formatCurrency(totalMonthlySpent, currency)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs font-medium text-slate-500">Budget Remaining</span>
            <p
              className={`mt-1 text-2xl font-bold font-mono tabular-nums ${
                totalMonthlyBudget - totalMonthlySpent >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(totalMonthlyBudget - totalMonthlySpent, currency)}
            </p>
          </div>
        </div>

        {/* Aggregate Progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-700">Overall Month Budget Pace</span>
            <span className="font-mono tabular-nums text-purple-700">{overallPercent}% Used</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent > 100
                  ? 'bg-rose-500'
                  : overallPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600'
              }`}
              style={{ width: `${Math.min(100, overallPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetStats.map((item) => {
          const { category, spent, budget, remaining, percent, isExceeded, isWarning } = item;
          const isEditing = editingId === category.id;

          let statusColor = 'text-blue-600 bg-blue-50';
          let barColor = 'bg-blue-600';
          let statusText = 'On Track';

          if (isExceeded) {
            statusColor = 'text-rose-700 bg-rose-50 border border-rose-200';
            barColor = 'bg-rose-500';
            statusText = 'Exceeded';
          } else if (isWarning) {
            statusColor = 'text-amber-700 bg-amber-50 border border-amber-200';
            barColor = 'bg-amber-500';
            statusText = 'Near Limit';
          }

          return (
            <div
              key={category.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                    style={{ backgroundColor: category.color }}
                  >
                    {getCategoryIcon(category.icon, 'w-5 h-5')}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {category.name}
                    </h3>
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Edit Budget Button or Form */}
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editBudgetValue}
                      onChange={(e) => setEditBudgetValue(e.target.value)}
                      className="w-20 h-7 rounded border border-purple-300 px-1.5 text-xs font-mono tabular-nums text-slate-900"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(category.id)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <Save className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(category.id, budget)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:border-purple-200 hover:text-purple-600 transition-colors"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit Limit</span>
                  </button>
                )}
              </div>

              {/* Progress and Numbers */}
              <div className="mt-4">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-mono tabular-nums text-slate-900 font-semibold text-sm">
                    {formatCurrency(spent, currency)}{' '}
                    <span className="text-slate-400 font-normal text-xs">
                      of {formatCurrency(budget, currency)}
                    </span>
                  </span>
                  <span className="font-mono tabular-nums text-xs font-bold text-slate-700">
                    {percent}%
                  </span>
                </div>

                <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {remaining >= 0 ? (
                      <span className="text-emerald-600 font-medium font-mono tabular-nums">
                        {formatCurrency(remaining, currency)} remaining
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium font-mono tabular-nums">
                        {formatCurrency(Math.abs(remaining), currency)} over budget
                      </span>
                    )}
                  </span>
                  <span>Monthly Cap</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
