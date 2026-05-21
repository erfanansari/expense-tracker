'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Asset, Expense, Income } from '@types';

import AssetForm from '@features/assets/components/AssetForm';
import ExpenseForm from '@features/expenses/components/ExpenseForm';
import IncomeForm from '@features/income/components/IncomeForm';

import FormDrawer from '@components/FormDrawer';

interface GlobalDrawerContextValue {
  openExpenseDrawer: (expense?: Expense) => void;
  openIncomeDrawer: (income?: Income) => void;
  openAssetDrawer: (asset?: Asset) => void;
  closeExpenseDrawer: () => void;
  closeIncomeDrawer: () => void;
  closeAssetDrawer: () => void;
}

const GlobalDrawerContext = createContext<GlobalDrawerContextValue | undefined>(undefined);

export const useGlobalDrawer = () => {
  const ctx = useContext(GlobalDrawerContext);
  if (!ctx) {
    throw new Error('useGlobalDrawer must be used within GlobalDrawerProvider');
  }
  return ctx;
};

export const GlobalDrawerProvider = ({ children }: { children: ReactNode }) => {
  // Expense
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseDirty, setExpenseDirty] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  // Income
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [incomeDirty, setIncomeDirty] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>();

  // Asset
  const [assetOpen, setAssetOpen] = useState(false);
  const [assetDirty, setAssetDirty] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();

  const openExpenseDrawer = useCallback((expense?: Expense) => {
    setEditingExpense(expense);
    setExpenseDirty(false);
    setExpenseOpen(true);
  }, []);
  const closeExpenseDrawer = useCallback(() => {
    setExpenseOpen(false);
    setExpenseDirty(false);
    setEditingExpense(undefined);
  }, []);

  const openIncomeDrawer = useCallback((income?: Income) => {
    setEditingIncome(income);
    setIncomeDirty(false);
    setIncomeOpen(true);
  }, []);
  const closeIncomeDrawer = useCallback(() => {
    setIncomeOpen(false);
    setIncomeDirty(false);
    setEditingIncome(undefined);
  }, []);

  const openAssetDrawer = useCallback((asset?: Asset) => {
    setEditingAsset(asset);
    setAssetDirty(false);
    setAssetOpen(true);
  }, []);
  const closeAssetDrawer = useCallback(() => {
    setAssetOpen(false);
    setAssetDirty(false);
    setEditingAsset(undefined);
  }, []);

  const value = useMemo<GlobalDrawerContextValue>(
    () => ({
      openExpenseDrawer,
      openIncomeDrawer,
      openAssetDrawer,
      closeExpenseDrawer,
      closeIncomeDrawer,
      closeAssetDrawer,
    }),
    [openExpenseDrawer, openIncomeDrawer, openAssetDrawer, closeExpenseDrawer, closeIncomeDrawer, closeAssetDrawer]
  );

  return (
    <GlobalDrawerContext.Provider value={value}>
      {children}

      <FormDrawer
        isOpen={expenseOpen}
        onClose={closeExpenseDrawer}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        isDirty={expenseDirty}
      >
        <ExpenseForm
          onExpenseAdded={closeExpenseDrawer}
          editingExpense={editingExpense}
          onCancelEdit={closeExpenseDrawer}
          setIsDirty={setExpenseDirty}
        />
      </FormDrawer>

      <FormDrawer
        isOpen={incomeOpen}
        onClose={closeIncomeDrawer}
        title={editingIncome ? 'Edit Income' : 'Add New Income'}
        isDirty={incomeDirty}
      >
        <IncomeForm
          onIncomeAdded={closeIncomeDrawer}
          editingIncome={editingIncome}
          onCancelEdit={closeIncomeDrawer}
          setIsDirty={setIncomeDirty}
        />
      </FormDrawer>

      <FormDrawer
        isOpen={assetOpen}
        onClose={closeAssetDrawer}
        title={editingAsset ? 'Edit Asset' : 'Add New Asset'}
        isDirty={assetDirty}
      >
        <AssetForm
          onAssetAdded={closeAssetDrawer}
          editingAsset={editingAsset}
          onCancelEdit={closeAssetDrawer}
          setIsDirty={setAssetDirty}
        />
      </FormDrawer>
    </GlobalDrawerContext.Provider>
  );
};
