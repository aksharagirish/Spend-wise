import { Category, CurrencyConfig, Transaction } from '../types';
import { DEFAULT_CURRENCIES, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';

const TX_STORAGE_KEY = 'spendwise_transactions_v1';
const CAT_STORAGE_KEY = 'spendwise_categories_v1';
const CURRENCY_STORAGE_KEY = 'spendwise_currency_v1';

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(TX_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
  } catch (err) {
    console.error('Error loading transactions from localStorage:', err);
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions to localStorage:', err);
  }
};

export const loadStoredCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(CAT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CATEGORIES;
  } catch (err) {
    console.error('Error loading categories from localStorage:', err);
    return INITIAL_CATEGORIES;
  }
};

export const saveStoredCategories = (categories: Category[]): void => {
  try {
    localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Error saving categories to localStorage:', err);
  }
};

export const loadStoredCurrency = (): CurrencyConfig => {
  try {
    const raw = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.code && parsed?.symbol) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_CURRENCIES[0]; // USD default
};

export const saveStoredCurrency = (currency: CurrencyConfig): void => {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(currency));
  } catch (err) {
    console.error('Error saving currency to localStorage:', err);
  }
};

export const formatCurrency = (amount: number, currency: CurrencyConfig): string => {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${currency.symbol}${formatted}` : `${currency.symbol}${formatted}`;
};

export const exportTransactionsToCSV = (transactions: Transaction[], currencySymbol: string): void => {
  const headers = ['Date', 'Title', 'Type', 'Category', 'Payment Method', `Amount (${currencySymbol})`, 'Notes'];
  const rows = transactions.map((t) => [
    `"${t.date}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.type.toUpperCase()}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.paymentMethod}"`,
    t.amount.toFixed(2),
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SpendWise_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
