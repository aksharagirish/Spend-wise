import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { Transaction } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/initialData';

const getUserTransactionsPath = (userId: string) => `users/${userId}/transactions`;

export const subscribeToTransactions = (
  userId: string,
  onSuccess: (transactions: Transaction[]) => void,
  onError: (err: any) => void
): Unsubscribe => {
  const path = getUserTransactionsPath(userId);
  const colRef = collection(db, path);
  const q = query(colRef, orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        txs.push({
          id: docSnap.id,
          title: data.title || '',
          amount: Number(data.amount) || 0,
          type: data.type === 'income' ? 'income' : 'expense',
          category: data.category || 'General',
          date: data.date || new Date().toISOString().slice(0, 10),
          paymentMethod: data.paymentMethod || 'card',
          notes: data.notes || undefined,
          createdAt: Number(data.createdAt) || Date.now(),
        });
      });
      onSuccess(txs);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
};

export const createFirestoreTransaction = async (
  userId: string,
  tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }
): Promise<string> => {
  const path = getUserTransactionsPath(userId);
  const docId = tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, path, docId);

  const payload = {
    id: docId,
    userId,
    title: tx.title,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    date: tx.date,
    paymentMethod: tx.paymentMethod,
    ...(tx.notes ? { notes: tx.notes } : {}),
    createdAt: Date.now(),
  };

  try {
    await setDoc(docRef, payload);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${docId}`);
  }
};

export const updateFirestoreTransaction = async (
  userId: string,
  txId: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<void> => {
  const path = getUserTransactionsPath(userId);
  const docRef = doc(db, path, txId);

  const payload: Record<string, any> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.paymentMethod !== undefined) payload.paymentMethod = updates.paymentMethod;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  try {
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${txId}`);
  }
};

export const deleteFirestoreTransaction = async (
  userId: string,
  txId: string
): Promise<void> => {
  const path = getUserTransactionsPath(userId);
  const docRef = doc(db, path, txId);

  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${txId}`);
  }
};

export const seedSampleTransactionsToFirestore = async (userId: string): Promise<void> => {
  const path = getUserTransactionsPath(userId);
  const batch = writeBatch(db);

  INITIAL_TRANSACTIONS.slice(0, 15).forEach((t) => {
    const docRef = doc(db, path, t.id);
    batch.set(docRef, {
      ...t,
      userId,
    });
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
