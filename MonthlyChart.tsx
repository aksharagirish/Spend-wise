import React, { useState } from 'react';
import { CurrencyConfig, Transaction } from '../types';
import { formatCurrency } from '../utils/storage';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface MonthlyChartProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
}

interface MonthData {
  key: string; // YYYY-MM
  label: string; // e.g. "Oct '26"
  fullLabel: string; // e.g. "October 2026"
  income: number;
  expense: number;
  net: number;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ transactions, currency }) => {
  const [activeView, setActiveView] = useState<'both' | 'expense' | 'net'>('both');
  const [hoveredMonth, setHoveredMonth] = useState<MonthData | null>(null);

  // Group transactions by month for the past 6 months
  const monthlyData: MonthData[] = React.useMemo(() => {
    const monthsMap = new Map<string, { income: number; expense: number }>();

    // Generate keys for the last 6 months up to current date (Oct 2026)
    const baseDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsMap.set(key, { income: 0, expense: 0 });
    }

    transactions.forEach((tx) => {
      const key = tx.date.slice(0, 7); // YYYY-MM
      if (monthsMap.has(key)) {
        const current = monthsMap.get(key)!;
        if (tx.type === 'income') {
          current.income += tx.amount;
        } else {
          current.expense += tx.amount;
        }
      }
    });

    const result: MonthData[] = [];
    monthsMap.forEach((val, key) => {
      const [year, month] = key.split('-').map(Number);
      const d = new Date(year, month - 1, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const fullLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      result.push({
        key,
        label,
        fullLabel,
        income: val.income,
        expense: val.expense,
        net: val.income - val.expense,
      });
    });

    return result;
  }, [transactions]);

  // Find max value for scaling the SVG chart
  const maxVal = React.useMemo(() => {
    let max = 1000;
    monthlyData.forEach((m) => {
      if (m.income > max) max = m.income;
      if (m.expense > max) max = m.expense;
      if (Math.abs(m.net) > max) max = Math.abs(m.net);
    });
    return Math.ceil(max / 1000) * 1000; // round up to nearest thousand
  }, [monthlyData]);

  // Chart dimensions
  const svgHeight = 220;
  const svgWidth = 560;
  const paddingBottom = 30;
  const paddingTop = 20;
  const chartHeight = svgHeight - paddingBottom - paddingTop;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      {/* Header & View Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Monthly Expense & Income</h2>
            <span className="text-xs text-slate-400 font-normal">Last 6 Months</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare monthly cashflow, spending habits and net savings
          </p>
        </div>

        {/* View Switcher Segmented Control */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveView('both')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeView === 'both'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income & Expense
          </button>
          <button
            onClick={() => setActiveView('expense')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeView === 'expense'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expenses Only
          </button>
          <button
            onClick={() => setActiveView('net')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              activeView === 'net'
                ? 'bg-white text-purple-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Net Savings
          </button>
        </div>
      </div>

      {/* Legend & Hover Info */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          {(activeView === 'both' || activeView === 'expense') && (
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-purple-500" />
              <span className="font-medium text-slate-700">Expenses</span>
            </div>
          )}
          {activeView === 'both' && (
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-500" />
              <span className="font-medium text-slate-700">Income</span>
            </div>
          )}
          {activeView === 'net' && (
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" />
              <span className="font-medium text-slate-700">Net Surplus / Savings</span>
            </div>
          )}
        </div>

        {/* Hover detail indicator */}
        <div className="h-6 flex items-center">
          {hoveredMonth ? (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="font-semibold text-slate-900">{hoveredMonth.fullLabel}:</span>
              {activeView !== 'net' && (
                <>
                  <span className="text-purple-600 font-mono tabular-nums">
                    Spent: {formatCurrency(hoveredMonth.expense, currency)}
                  </span>
                  {activeView === 'both' && (
                    <span className="text-blue-600 font-mono tabular-nums">
                      Earned: {formatCurrency(hoveredMonth.income, currency)}
                    </span>
                  )}
                </>
              )}
              <span
                className={`font-mono tabular-nums font-semibold ${
                  hoveredMonth.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                Net: {formatCurrency(hoveredMonth.net, currency)}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Info className="h-3 w-3" /> Hover bars to inspect monthly totals
            </span>
          )}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="mt-2 w-full overflow-x-auto">
        <div className="min-w-[480px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 overflow-visible"
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = paddingTop + chartHeight * (1 - pct);
              const labelVal = Math.round(maxVal * pct);
              return (
                <g key={idx}>
                  <line
                    x1="45"
                    y1={y}
                    x2={svgWidth - 10}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                    strokeDasharray={pct === 0 ? undefined : '3 3'}
                  />
                  <text
                    x="40"
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono tabular-nums"
                  >
                    {currency.symbol}
                    {labelVal >= 1000 ? `${(labelVal / 1000).toFixed(0)}k` : labelVal}
                  </text>
                </g>
              );
            })}

            {/* Bars for each month */}
            {monthlyData.map((m, idx) => {
              const count = monthlyData.length;
              const usableWidth = svgWidth - 60;
              const slotWidth = usableWidth / count;
              const centerX = 55 + idx * slotWidth + slotWidth / 2;

              if (activeView === 'both') {
                const barWidth = 16;
                const gap = 4;
                const expenseHeight = (m.expense / maxVal) * chartHeight;
                const incomeHeight = (m.income / maxVal) * chartHeight;

                const incomeX = centerX - barWidth - gap / 2;
                const expenseX = centerX + gap / 2;

                const incomeY = paddingTop + chartHeight - incomeHeight;
                const expenseY = paddingTop + chartHeight - expenseHeight;

                return (
                  <g
                    key={m.key}
                    onMouseEnter={() => setHoveredMonth(m)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="cursor-pointer group"
                  >
                    {/* Invisible hover area */}
                    <rect
                      x={centerX - slotWidth / 2}
                      y={paddingTop}
                      width={slotWidth}
                      height={chartHeight + paddingBottom}
                      fill="transparent"
                    />

                    {/* Income Bar (Blue) */}
                    <rect
                      x={incomeX}
                      y={incomeY}
                      width={barWidth}
                      height={Math.max(2, incomeHeight)}
                      rx="4"
                      fill="#3B82F6"
                      className="transition-all duration-200 group-hover:brightness-110"
                    />

                    {/* Expense Bar (Purple) */}
                    <rect
                      x={expenseX}
                      y={expenseY}
                      width={barWidth}
                      height={Math.max(2, expenseHeight)}
                      rx="4"
                      fill="#8B5CF6"
                      className="transition-all duration-200 group-hover:brightness-110"
                    />

                    {/* Month Label */}
                    <text
                      x={centerX}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      className="text-[11px] font-semibold fill-slate-500 group-hover:fill-slate-900 transition-colors"
                    >
                      {m.label}
                    </text>
                  </g>
                );
              }

              if (activeView === 'expense') {
                const barWidth = 28;
                const expenseHeight = (m.expense / maxVal) * chartHeight;
                const expenseX = centerX - barWidth / 2;
                const expenseY = paddingTop + chartHeight - expenseHeight;

                return (
                  <g
                    key={m.key}
                    onMouseEnter={() => setHoveredMonth(m)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x={centerX - slotWidth / 2}
                      y={paddingTop}
                      width={slotWidth}
                      height={chartHeight + paddingBottom}
                      fill="transparent"
                    />
                    <rect
                      x={expenseX}
                      y={expenseY}
                      width={barWidth}
                      height={Math.max(2, expenseHeight)}
                      rx="5"
                      fill="#8B5CF6"
                      className="transition-all duration-200 group-hover:fill-purple-600"
                    />
                    <text
                      x={centerX}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      className="text-[11px] font-semibold fill-slate-500 group-hover:fill-slate-900"
                    >
                      {m.label}
                    </text>
                  </g>
                );
              }

              // Net Savings view
              const barWidth = 26;
              const isPositive = m.net >= 0;
              const netHeight = (Math.abs(m.net) / maxVal) * chartHeight;
              const netX = centerX - barWidth / 2;
              const netY = paddingTop + chartHeight - netHeight;

              return (
                <g
                  key={m.key}
                  onMouseEnter={() => setHoveredMonth(m)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="cursor-pointer group"
                >
                  <rect
                    x={centerX - slotWidth / 2}
                    y={paddingTop}
                    width={slotWidth}
                    height={chartHeight + paddingBottom}
                    fill="transparent"
                  />
                  <rect
                    x={netX}
                    y={netY}
                    width={barWidth}
                    height={Math.max(2, netHeight)}
                    rx="5"
                    fill={isPositive ? '#10B981' : '#F43F5E'}
                    className="transition-all duration-200 group-hover:brightness-110"
                  />
                  <text
                    x={centerX}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="text-[11px] font-semibold fill-slate-500 group-hover:fill-slate-900"
                  >
                    {m.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
