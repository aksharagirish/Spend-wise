import React from 'react';
import { Transaction, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/storage';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction?: Transaction | null;
  currency: CurrencyConfig;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  currency,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Delete Transaction</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete this transaction? This action cannot be undone.
          </p>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{transaction.title}</p>
                <p className="text-xs text-slate-500">
                  {transaction.category} · {transaction.date}
                </p>
              </div>
              <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                {formatCurrency(transaction.amount, currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
