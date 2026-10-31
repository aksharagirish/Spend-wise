import React, { useState, useEffect } from 'react';
import { Category, CurrencyConfig, PaymentMethod, Transaction, TransactionType } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  X,
  Plus,
  Calendar,
  CreditCard,
  Banknote,
  Building,
  Smartphone,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  categories: Category[];
  currency: CurrencyConfig;
  editingTransaction?: Transaction | null;
  onAddCustomCategory: (category: Omit<Category, 'id'>) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  currency,
  editingTransaction,
  onAddCustomCategory,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // New category inline creation state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');
  const [newCatIcon, setNewCatIcon] = useState('Tag');

  // Pre-fill when editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
    } else {
      // Default to expense
      setType('expense');
      setTitle('');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === 'expense');
      setCategory(defaultCat ? defaultCat.name : '');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('card');
      setNotes('');
    }
    setError(null);
    setIsCreatingCategory(false);
  }, [editingTransaction, isOpen, categories]);

  if (!isOpen) return null;

  // Filter categories by selected type
  const availableCategories = categories.filter((c) => c.type === type);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType);
    if (firstCat) {
      setCategory(firstCat.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Please enter a description or title for the transaction.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    onSave({
      id: editingTransaction?.id,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCustomCategory({
      name: newCatName.trim(),
      type,
      color: newCatColor,
      icon: newCatIcon,
    });

    setCategory(newCatName.trim());
    setIsCreatingCategory(false);
    setNewCatName('');
  };

  // Quick title suggestions based on type
  const suggestions =
    type === 'expense'
      ? ['Groceries', 'Coffee & Snack', 'Apartment Rent', 'Dinner Out', 'Uber Ride', 'Internet Bill']
      : ['Monthly Salary', 'Client Milestone', 'Consulting Retainer', 'Investment Dividend', 'Cash Gift'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="text-xs text-slate-500">
              {editingTransaction ? 'Update existing transaction details' : 'Track an income or expense'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Income / Expense Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-white text-rose-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-white text-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Income (+)
              </button>
            </div>
          </div>

          {/* Amount Input with prominent currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Amount ({currency.code})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-slate-400">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xl font-bold font-mono tabular-nums text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Title & Quick Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Whole Foods Groceries, Tech Salary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:bg-white focus:outline-hidden"
            />
            {/* Suggestions */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {suggestions.slice(0, 4).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setTitle(s)}
                  className="rounded-md bg-slate-100 hover:bg-purple-50 hover:text-purple-700 px-2 py-0.5 text-[11px] text-slate-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 hover:underline"
              >
                {isCreatingCategory ? 'Cancel New Category' : '+ New Category'}
              </button>
            </div>

            {isCreatingCategory ? (
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 space-y-2">
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full h-8 rounded-lg border border-purple-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {['#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#06B6D4'].map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setNewCatColor(col)}
                        className={`h-5 w-5 rounded-full transition-transform ${
                          newCatColor === col ? 'scale-125 ring-2 ring-purple-600 ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCatName.trim()}
                    className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-hidden"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Payment Method 2-column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-hidden"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="wallet">Digital Wallet / Apple Pay</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Receipt #482, reimbursed by client"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs shadow-indigo-500/20 hover:opacity-95 transition-all"
            >
              {editingTransaction ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
