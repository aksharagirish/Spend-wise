import React from 'react';
import { Category, CurrencyConfig, Transaction } from '../types';
import { formatCurrency } from '../utils/storage';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  Edit2,
  Trash2,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Search,
  CreditCard,
  Banknote,
  Building,
  Smartphone,
} from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onViewAll: () => void;
  onOpenAddModal: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  categories,
  currency,
  onEdit,
  onDelete,
  onViewAll,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = React.useMemo(() => {
    let list = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return list.slice(0, 7); // Display top 7 recent
  }, [transactions, searchTerm]);

  const getCategoryDetails = (categoryName: string) => {
    const found = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
    return {
      color: found?.color || '#64748B',
      icon: found?.icon || 'Tag',
    };
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-3 w-3" />;
      case 'cash':
        return <Banknote className="h-3 w-3" />;
      case 'bank':
        return <Building className="h-3 w-3" />;
      case 'wallet':
        return <Smartphone className="h-3 w-3" />;
      default:
        return <CreditCard className="h-3 w-3" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {transactions.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500">Live transaction log with instant edit & delete</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search recent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline px-2 py-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="mt-3 divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-3">
              <Receipt className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No transactions found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchTerm ? 'Try adjusting your search query' : 'Start tracking by logging your first expense or income.'}
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
            >
              Add Transaction
            </button>
          </div>
        ) : (
          filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            const cat = getCategoryDetails(tx.category);

            return (
              <div
                key={tx.id}
                className="group flex items-center justify-between py-3 px-2 rounded-xl transition-colors hover:bg-slate-50/80"
              >
                {/* Left side: Category Icon & Title/Meta */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {getCategoryIcon(cat.icon, 'w-4 h-4')}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{tx.category}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono text-[11px] tabular-nums">
                        {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="flex items-center gap-1 text-[11px] capitalize text-slate-500">
                        {getPaymentIcon(tx.paymentMethod)}
                        <span className="hidden sm:inline">{tx.paymentMethod}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount & Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-bold font-mono tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                    {tx.notes && (
                      <p className="hidden md:block text-[11px] text-slate-400 truncate max-w-[150px]">
                        {tx.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions (visible on hover / always accessible) */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      title="Edit transaction"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors"
                      aria-label={`Edit ${tx.title}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(tx)}
                      title="Delete transaction"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                      aria-label={`Delete ${tx.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
