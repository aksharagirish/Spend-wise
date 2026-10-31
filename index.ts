export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'card' | 'cash' | 'bank' | 'wallet';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  monthlyBudget?: number;
}

export type DateRangePreset = 'all' | 'this_month' | 'last_month' | 'this_year' | 'custom';
export type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export interface FilterState {
  search: string;
  type: 'all' | TransactionType;
  category: string;
  dateRange: DateRangePreset;
  startDate?: string;
  endDate?: string;
  sortBy: SortOption;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export type NavigationTab = 'dashboard' | 'transactions' | 'analytics' | 'budgets' | 'settings';
