import React, { useState, useEffect, useMemo } from 'react';
import { Category, CurrencyConfig, NavigationTab, Transaction } from './types';
import {
  loadStoredCategories,
  loadStoredCurrency,
  loadStoredTransactions,
  saveStoredCategories,
  saveStoredCurrency,
  saveStoredTransactions,
  exportTransactionsToCSV,
} from './utils/storage';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from './data/initialData';
import { useAuth } from './context/AuthContext';
import {
  subscribeToTransactions,
  createFirestoreTransaction,
  updateFirestoreTransaction,
  deleteFirestoreTransaction,
  seedSampleTransactionsToFirestore,
} from './firebase/firestoreService';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { StatCards } from './components/StatCards';
import { MonthlyChart } from './components/MonthlyChart';
import { CategoryBreakdownChart } from './components/CategoryBreakdownChart';
import { RecentTransactions } from './components/RecentTransactions';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { BudgetsView } from './components/BudgetsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import {
  Loader2,
  Cloud,
  AlertCircle,
  X,
  Sparkles,
  Database,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();

  // Core transaction & categories states
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStoredTransactions());
  const [categories, setCategories] = useState<Category[]>(() => loadStoredCategories());
  const [currency, setCurrency] = useState<CurrencyConfig>(() => loadStoredCurrency());

  // Firestore Sync & Loading state
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isSeedingCloud, setIsSeedingCloud] = useState(false);

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Synchronize categories and currency to localStorage
  useEffect(() => {
    saveStoredCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveStoredCurrency(currency);
  }, [currency]);

  // Subscribe to Firestore when user is logged in
  useEffect(() => {
    if (user) {
      setTransactionsLoading(true);
      setFirestoreError(null);

      const unsubscribe = subscribeToTransactions(
        user.uid,
        (fetchedTxs) => {
          setTransactions(fetchedTxs);
          setTransactionsLoading(false);
        },
        (err) => {
          console.error('Failed to subscribe to Firestore transactions:', err);
          setFirestoreError('Could not sync with Cloud Firestore. Please check your network connection.');
          setTransactionsLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Unauthenticated fallback: load local transactions
      setTransactions(loadStoredTransactions());
      setTransactionsLoading(false);
    }
  }, [user]);

  // Save to local storage only if unauthenticated
  useEffect(() => {
    if (!user) {
      saveStoredTransactions(transactions);
    }
  }, [transactions, user]);

  // Real-time calculations: Total Balance, Total Income, Total Expenses
  const { totalIncome, totalExpenses, totalBalance, thisMonthIncome, thisMonthExpense } =
    useMemo(() => {
      let income = 0;
      let expenses = 0;
      let mIncome = 0;
      let mExpense = 0;

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      transactions.forEach((tx) => {
        const isThisMonth = () => {
          const d = new Date(tx.date + 'T00:00:00');
          return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        };

        if (tx.type === 'income') {
          income += tx.amount;
          if (isThisMonth()) {
            mIncome += tx.amount;
          }
        } else {
          expenses += tx.amount;
          if (isThisMonth()) {
            mExpense += tx.amount;
          }
        }
      });

      return {
        totalIncome: income,
        totalExpenses: expenses,
        totalBalance: income - expenses,
        thisMonthIncome: mIncome,
        thisMonthExpense: mExpense,
      };
    }, [transactions]);

  // Handlers for Transactions CRUD (Firestore + Local fallback)
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }
  ) => {
    try {
      if (user) {
        if (data.id) {
          // Editing existing transaction in Firestore
          await updateFirestoreTransaction(user.uid, data.id, {
            title: data.title,
            amount: data.amount,
            type: data.type,
            category: data.category,
            date: data.date,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
          });
        } else {
          // Creating new transaction in Firestore
          await createFirestoreTransaction(user.uid, {
            title: data.title,
            amount: data.amount,
            type: data.type,
            category: data.category,
            date: data.date,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
          });
        }
      } else {
        // Local mode fallback
        if (data.id) {
          setTransactions((prev) =>
            prev.map((item) =>
              item.id === data.id
                ? {
                    ...item,
                    title: data.title,
                    amount: data.amount,
                    type: data.type,
                    category: data.category,
                    date: data.date,
                    paymentMethod: data.paymentMethod,
                    notes: data.notes,
                  }
                : item
            )
          );
        } else {
          const newTx: Transaction = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: data.title,
            amount: data.amount,
            type: data.type,
            category: data.category,
            date: data.date,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            createdAt: Date.now(),
          };
          setTransactions((prev) => [newTx, ...prev]);
        }
      }
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      setFirestoreError('Failed to save transaction to Cloud Firestore.');
    }
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteClick = (tx: Transaction) => {
    setDeletingTransaction(tx);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;

    try {
      if (user) {
        await deleteFirestoreTransaction(user.uid, deletingTransaction.id);
      } else {
        setTransactions((prev) => prev.filter((t) => t.id !== deletingTransaction.id));
      }
      setDeletingTransaction(null);
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      setFirestoreError('Failed to delete transaction from Cloud Firestore.');
    }
  };

  const handleDeleteMultiple = async (ids: string[]) => {
    try {
      if (user) {
        for (const id of ids) {
          await deleteFirestoreTransaction(user.uid, id);
        }
      } else {
        setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));
      }
    } catch (err: any) {
      console.error('Error deleting multiple transactions:', err);
      setFirestoreError('Failed to delete selected transactions.');
    }
  };

  const handleSeedCloudData = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSeedingCloud(true);
    try {
      await seedSampleTransactionsToFirestore(user.uid);
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Error seeding data:', err);
      setFirestoreError('Failed to seed starter data to Firestore.');
    } finally {
      setIsSeedingCloud(false);
    }
  };

  const handleResetSampleData = () => {
    if (user) {
      handleSeedCloudData();
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      setCategories(INITIAL_CATEGORIES);
    }
  };

  const handleClearAllData = async () => {
    if (user) {
      try {
        for (const tx of transactions) {
          await deleteFirestoreTransaction(user.uid, tx.id);
        }
      } catch (err) {
        console.error('Failed to clear cloud data:', err);
      }
    } else {
      setTransactions([]);
    }
  };

  const handleImportJSON = (imported: { transactions: Transaction[]; categories?: Category[] }) => {
    if (user) {
      // In cloud mode, add each imported transaction
      imported.transactions.forEach((t) => {
        createFirestoreTransaction(user.uid, t);
      });
    } else {
      setTransactions(imported.transactions);
    }
    if (imported.categories && imported.categories.length > 0) {
      setCategories(imported.categories);
    }
  };

  const handleAddCustomCategory = (newCat: Omit<Category, 'id'>) => {
    const created: Category = {
      ...newCat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, created]);
  };

  const handleUpdateCategoryBudget = (categoryId: string, newBudget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, monthlyBudget: newBudget } : c))
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        monthlyIncome={thisMonthIncome}
        monthlyExpense={thisMonthExpense}
        currencySymbol={currency.symbol}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header with Auth state */}
        <TopHeader
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsTransactionModalOpen(true);
          }}
          currency={currency}
          onOpenCurrencySelect={() => setCurrentTab('settings')}
          onExportCSV={() => exportTransactionsToCSV(transactions, currency.symbol)}
          user={user}
          authLoading={authLoading}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={logout}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Error Notification Banner */}
            {firestoreError && (
              <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{firestoreError}</span>
                </div>
                <button
                  onClick={() => setFirestoreError(null)}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Cloud Sync Announcement Banner for Unauthenticated Users */}
            {!authLoading && !user && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-2xs">
                    <Cloud className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Sync SpendWise with Firebase Cloud Firestore
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sign in or create an account to store transactions securely under your user account.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors shrink-0"
                >
                  <span>Sign In / Sign Up</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Empty Cloud Account Prompt */}
            {!authLoading && user && !transactionsLoading && transactions.length === 0 && (
              <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-2xs text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your Cloud Database is Ready!</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    You have authenticated into Firebase Firestore. Start tracking your income and expenses or load starter demonstration data to explore.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditingTransaction(null);
                      setIsTransactionModalOpen(true);
                    }}
                    className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
                  >
                    + Add First Transaction
                  </button>
                  <button
                    onClick={handleSeedCloudData}
                    disabled={isSeedingCloud}
                    className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
                  >
                    {isSeedingCloud ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Loading Starter Data...</span>
                      </>
                    ) : (
                      <>
                        <Database className="h-3.5 w-3.5" />
                        <span>Load Starter Demo Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator while streaming Firestore */}
            {transactionsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-slate-200/80 bg-white p-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
                <p className="text-sm font-semibold text-slate-800">Syncing with Cloud Firestore...</p>
                <p className="text-xs text-slate-400 mt-1">Fetching your authenticated transactions</p>
              </div>
            ) : (
              <>
                {/* Dashboard View */}
                {currentTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* 1. Stat Cards */}
                    <StatCards
                      totalBalance={totalBalance}
                      totalIncome={totalIncome}
                      totalExpenses={totalExpenses}
                      currency={currency}
                      thisMonthIncome={thisMonthIncome}
                      thisMonthExpense={thisMonthExpense}
                    />

                    {/* 2. Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-7">
                        <MonthlyChart transactions={transactions} currency={currency} />
                      </div>
                      <div className="lg:col-span-5">
                        <CategoryBreakdownChart
                          transactions={transactions}
                          categories={categories}
                          currency={currency}
                          onFilterByCategory={() => {
                            setCurrentTab('transactions');
                          }}
                        />
                      </div>
                    </div>

                    {/* 3. Recent Transactions */}
                    <RecentTransactions
                      transactions={transactions}
                      categories={categories}
                      currency={currency}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      onViewAll={() => setCurrentTab('transactions')}
                      onOpenAddModal={() => {
                        setEditingTransaction(null);
                        setIsTransactionModalOpen(true);
                      }}
                    />
                  </div>
                )}

                {/* Transactions Ledger View */}
                {currentTab === 'transactions' && (
                  <TransactionList
                    transactions={transactions}
                    categories={categories}
                    currency={currency}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onDeleteMultiple={handleDeleteMultiple}
                    onOpenAddModal={() => {
                      setEditingTransaction(null);
                      setIsTransactionModalOpen(true);
                    }}
                  />
                )}

                {/* Analytics & Trends View */}
                {currentTab === 'analytics' && (
                  <AnalyticsView
                    transactions={transactions}
                    categories={categories}
                    currency={currency}
                  />
                )}

                {/* Budgets & Goals View */}
                {currentTab === 'budgets' && (
                  <BudgetsView
                    categories={categories}
                    transactions={transactions}
                    currency={currency}
                    onUpdateCategoryBudget={handleUpdateCategoryBudget}
                    onOpenAddModal={() => {
                      setEditingTransaction(null);
                      setIsTransactionModalOpen(true);
                    }}
                  />
                )}

                {/* Settings & Backups View */}
                {currentTab === 'settings' && (
                  <SettingsView
                    currency={currency}
                    onSelectCurrency={setCurrency}
                    categories={categories}
                    transactions={transactions}
                    onResetSampleData={handleResetSampleData}
                    onClearAllData={handleClearAllData}
                    onImportJSON={handleImportJSON}
                    onAddCategory={handleAddCustomCategory}
                    user={user}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onLogout={logout}
                    onSeedCloudSampleData={handleSeedCloudData}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        currency={currency}
        editingTransaction={editingTransaction}
        onAddCustomCategory={handleAddCustomCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        transaction={deletingTransaction}
        currency={currency}
      />

      {/* Firebase Authentication Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
