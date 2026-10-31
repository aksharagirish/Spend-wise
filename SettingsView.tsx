import React, { useRef, useState } from 'react';
import { Category, CurrencyConfig, Transaction } from '../types';
import { DEFAULT_CURRENCIES } from '../data/initialData';
import { exportTransactionsToCSV } from '../utils/storage';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  Settings,
  Coins,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  Tag,
  Plus,
  ShieldAlert,
  Cloud,
  User as UserIcon,
  LogIn,
  LogOut,
  Database,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface SettingsViewProps {
  currency: CurrencyConfig;
  onSelectCurrency: (c: CurrencyConfig) => void;
  categories: Category[];
  transactions: Transaction[];
  onResetSampleData: () => void;
  onClearAllData: () => void;
  onImportJSON: (imported: { transactions: Transaction[]; categories?: Category[] }) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  user: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onSeedCloudSampleData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currency,
  onSelectCurrency,
  categories,
  transactions,
  onResetSampleData,
  onClearAllData,
  onImportJSON,
  onAddCategory,
  user,
  onOpenAuthModal,
  onLogout,
  onSeedCloudSampleData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // New category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [newCatBudget, setNewCatBudget] = useState('200');

  const showNotification = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleExportJSON = () => {
    const data = {
      app: 'SpendWise',
      exportDate: new Date().toISOString(),
      currency,
      transactions,
      categories,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SpendWise_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showNotification('JSON backup successfully exported.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.transactions)) {
          onImportJSON({
            transactions: parsed.transactions,
            categories: Array.isArray(parsed.categories) ? parsed.categories : undefined,
          });
          showNotification(`Successfully restored ${parsed.transactions.length} transactions!`);
        } else {
          alert('Invalid backup file format: missing transactions array.');
        }
      } catch (err) {
        alert('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCategory({
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
      icon: 'Tag',
      monthlyBudget: newCatType === 'expense' ? parseFloat(newCatBudget) || 200 : undefined,
    });

    setNewCatName('');
    showNotification(`Category "${newCatName}" added.`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {successNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <Check className="h-4 w-4" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Account & Firebase Firestore Cloud Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 text-white">
              <Cloud className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Firebase Cloud Sync & Account</h3>
              <p className="text-xs text-slate-500">
                Sync transactions across devices securely using Cloud Firestore
              </p>
            </div>
          </div>

          {user && (
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              Connected
            </span>
          )}
        </div>

        <div className="mt-4">
          {user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-purple-100 bg-purple-50/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white uppercase text-sm">
                  {user.email ? user.email[0] : 'U'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-950">{user.email}</p>
                  <p className="text-[11px] text-purple-700">
                    User UID: <span className="font-mono">{user.uid.slice(0, 16)}...</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSeedCloudSampleData}
                  className="rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  Load Starter Data
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div>
                <p className="text-xs font-bold text-slate-800">You are currently in Local Storage mode</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in or create an account to persist your transactions to Cloud Firestore.
                </p>
              </div>
              <button
                onClick={onOpenAuthModal}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In / Create Account</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Currency Settings Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Coins className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Active Currency</h3>
            <p className="text-xs text-slate-500">
              Select the currency symbol used across the dashboard and reports
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEFAULT_CURRENCIES.map((c) => {
            const isSelected = currency.code === c.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  onSelectCurrency(c);
                  showNotification(`Currency switched to ${c.name}`);
                }}
                className={`flex items-center justify-between rounded-xl p-3 border transition-all text-left ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <span className="block font-bold text-slate-900 text-sm">{c.code}</span>
                  <span className="text-[11px] text-slate-500">{c.name.split('(')[0]}</span>
                </div>
                <span className="font-mono text-base font-bold text-purple-600">
                  {c.symbol}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Manager Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Tag className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Categories Manager</h3>
            <p className="text-xs text-slate-500">
              Custom categories and monthly budget limits
            </p>
          </div>
        </div>

        {/* Create new category */}
        <form onSubmit={handleCreateCategory} className="mt-4 flex flex-wrap gap-2.5 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Gym"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-purple-600"
            />
          </div>

          <div className="w-28">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
            <select
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value as 'expense' | 'income')}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 text-xs text-slate-900 focus:outline-hidden"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          {newCatType === 'expense' && (
            <div className="w-28">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Budget ({currency.symbol})
              </label>
              <input
                type="number"
                value={newCatBudget}
                onChange={(e) => setNewCatBudget(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 text-xs text-slate-900 focus:outline-hidden font-mono tabular-nums"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 self-center pb-0.5">
            {['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'].map((col) => (
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
            type="submit"
            disabled={!newCatName.trim()}
            className="h-9 flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: c.color }}
                >
                  {getCategoryIcon(c.icon, 'w-3.5 h-3.5')}
                </span>
                <div>
                  <span className="text-xs font-semibold text-slate-800 block truncate max-w-[120px]">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">{c.type}</span>
                </div>
              </div>
              {c.monthlyBudget && (
                <span className="text-[11px] font-mono tabular-nums text-slate-600 font-medium">
                  {currency.symbol}{c.monthlyBudget}/mo
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Data Recovery */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Download className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Data Backup & Export</h3>
            <p className="text-xs text-slate-500">
              Export your data anytime to keep local spreadsheet and JSON copies.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => exportTransactionsToCSV(transactions, currency.symbol)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-purple-600" />
            <span>Export to CSV Spreadsheet</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>Download Full JSON Backup</span>
          </button>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors">
            <Upload className="h-4 w-4 text-emerald-600" />
            <span>Restore From JSON Backup</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 border-b border-rose-100 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Reset & Danger Zone</h3>
            <p className="text-xs text-slate-500">
              Restore clean demonstration sample data or clear all records
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (confirm('Reset to initial sample transactions and categories?')) {
                onResetSampleData();
                showNotification('Sample demo data reloaded!');
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-purple-600" />
            <span>Reset to Sample Data</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Clear all stored transactions? This cannot be undone.')) {
                onClearAllData();
                showNotification('All transactions cleared.');
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Wipe All Stored Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
