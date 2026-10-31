import React, { useState } from 'react';
import { Category, CurrencyConfig, Transaction } from '../types';
import { formatCurrency } from '../utils/storage';
import { getCategoryIcon } from '../utils/categoryIcons';
import { PieChart, ArrowRight } from 'lucide-react';

interface CategoryBreakdownChartProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  onFilterByCategory?: (categoryName: string) => void;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  transactions,
  categories,
  currency,
  onFilterByCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Calculate expense category totals
  const { categoryTotals, totalExpense } = React.useMemo(() => {
    const totals: Record<string, number> = {};
    let sum = 0;

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
        sum += t.amount;
      });

    const sorted = Object.entries(totals)
      .map(([name, amount]) => {
        const cat = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          amount,
          color: cat?.color || '#94A3B8',
          icon: cat?.icon || 'Tag',
          percentage: sum > 0 ? (amount / sum) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { categoryTotals: sorted, totalExpense: sum };
  }, [transactions, categories]);

  // Donut SVG parameters
  const size = 160;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const donutSlices = categoryTotals.slice(0, 6).map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += (item.percentage / 100) * circumference;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Expense by Category</h2>
          <p className="text-xs text-slate-500">Distribution of current expenditures</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
          <PieChart className="h-4 w-4" />
        </div>
      </div>

      {totalExpense === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium text-slate-600">No expenses recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">Expenses will appear here categorized.</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col md:flex-row items-center gap-6">
          {/* Donut Chart Visual */}
          <div className="relative flex shrink-0 items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              {donutSlices.map((slice) => (
                <circle
                  key={slice.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={hoveredCategory === slice.name ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(slice.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => onFilterByCategory?.(slice.name)}
                />
              ))}
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Spent
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-mono tabular-nums">
                {formatCurrency(totalExpense, currency)}
              </span>
            </div>
          </div>

          {/* Top Category List */}
          <div className="flex-1 w-full space-y-2">
            {categoryTotals.slice(0, 5).map((cat) => {
              const isHovered = hoveredCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => onFilterByCategory?.(cat.name)}
                  className={`group flex items-center justify-between rounded-xl p-2 transition-all cursor-pointer ${
                    isHovered ? 'bg-purple-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {getCategoryIcon(cat.icon, 'w-3.5 h-3.5')}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-purple-700">
                        {cat.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono tabular-nums">
                        <span>{cat.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono tabular-nums text-slate-900">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                  </div>
                </div>
              );
            })}

            {categoryTotals.length > 5 && (
              <p className="pt-1 text-center text-[11px] font-medium text-slate-400">
                + {categoryTotals.length - 5} more categories in Transactions tab
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
