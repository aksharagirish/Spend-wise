import React, { useState, useMemo } from 'react';
import { Category, CurrencyConfig, DateRangePreset, SortOption, Transaction, TransactionType } from '../types';
import { formatCurrency, exportTransactionsToCSV } from '../utils/storage';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  Banknote,
  Building,
  Smartphone,
  CheckSquare,
  Square,
  ArrowUpRight,
  ArrowDownLeft,
  X,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  currency,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onOpenAddModal,
}) => {
  // Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRangePreset>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Category map
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.name.toLowerCase(), c));
    return map;
  }, [categories]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Date range filter
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (dateRange === 'this_month') {
      result = result.filter((t) => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    } else if (dateRange === 'last_month') {
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const lastMonthYear = lastMonthDate.getFullYear();
      const lastMonth = lastMonthDate.getMonth();
      result = result.filter((t) => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
      });
    } else if (dateRange === 'this_year') {
      result = result.filter((t) => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getFullYear() === currentYear;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, search, typeFilter, selectedCategory, dateRange, sortBy]);

  // Aggregate sums for filtered results
  const { filteredIncome, filteredExpense, filteredNet } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return { filteredIncome: inc, filteredExpense: exp, filteredNet: inc - exp };
  }, [filteredTransactions]);

  // Multi-select helpers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected transaction(s)?`)) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-3.5 w-3.5" />;
      case 'cash':
        return <Banknote className="h-3.5 w-3.5" />;
      case 'bank':
        return <Building className="h-3.5 w-3.5" />;
      case 'wallet':
        return <Smartphone className="h-3.5 w-3.5" />;
      default:
        return <CreditCard className="h-3.5 w-3.5" />;
    }
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    selectedCategory !== 'all' ||
    dateRange !== 'all';

  const clearAllFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setSelectedCategory('all');
    setDateRange('all');
    setSortBy('date_desc');
  };

  return (
    <div className="space-y-4">
      {/* Filters & Actions Control Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Top search & quick actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, category, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-hidden"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={() => exportTransactionsToCSV(filteredTransactions, currency.symbol)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs shadow-indigo-500/20 hover:opacity-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Filter Badges & Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Type Segmented Control */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => setTypeFilter('all')}
              className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                typeFilter === 'expense'
                  ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                typeFilter === 'income'
                  ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-purple-500 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangePreset)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-purple-500 focus:outline-hidden"
            >
              <option value="all">All Dates</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-purple-500 focus:outline-hidden"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="amount_desc">Amount: Highest First</option>
              <option value="amount_asc">Amount: Lowest First</option>
            </select>
          </div>

          {/* Clear filters shortcut */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter summary strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-500">
        <div>
          <span>Showing </span>
          <span className="font-semibold text-slate-900 font-mono tabular-nums">
            {filteredTransactions.length}
          </span>
          <span> of {transactions.length} records</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono tabular-nums">
            Income: <strong className="text-emerald-600 font-semibold">+{formatCurrency(filteredIncome, currency)}</strong>
          </span>
          <span className="font-mono tabular-nums">
            Expense: <strong className="text-slate-900 font-semibold">-{formatCurrency(filteredExpense, currency)}</strong>
          </span>
          <span className="font-mono tabular-nums">
            Net: <strong className={filteredNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatCurrency(filteredNet, currency)}</strong>
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center text-slate-400 hover:text-purple-600"
                    title="Select all"
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredTransactions.length ? (
                      <CheckSquare className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Transaction / Category</th>
                <th className="py-3 px-4 hidden md:table-cell">Date</th>
                <th className="py-3 px-4 hidden sm:table-cell">Method</th>
                <th className="py-3 px-4 hidden lg:table-cell">Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-semibold text-slate-700">No matching transactions</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try altering filters or search criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isSelected = selectedIds.includes(tx.id);
                  const cat = categoryMap.get(tx.category.toLowerCase()) || {
                    color: '#64748B',
                    icon: 'Tag',
                    name: tx.category,
                  };

                  return (
                    <tr
                      key={tx.id}
                      className={`group transition-colors ${
                        isSelected ? 'bg-purple-50/50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleSelect(tx.id)}
                          className="flex items-center text-slate-400 hover:text-purple-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-purple-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Title & Category Badge */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                            style={{ backgroundColor: cat.color }}
                          >
                            {getCategoryIcon(cat.icon, 'w-4 h-4')}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                              {tx.title}
                            </p>
                            <span className="text-xs text-slate-500 font-medium">
                              {tx.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap text-xs text-slate-600 font-mono tabular-nums">
                        {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 hidden sm:table-cell whitespace-nowrap text-xs text-slate-600 capitalize">
                        <span className="inline-flex items-center gap-1.5">
                          {getPaymentIcon(tx.paymentMethod)}
                          <span>{tx.paymentMethod}</span>
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-500 max-w-[200px] truncate">
                        {tx.notes || '—'}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono tabular-nums font-bold">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(tx)}
                            title="Edit"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(tx)}
                            title="Delete"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
