'use client';

import AssetForm from '@features/assets/components/AssetForm';
import ExpenseForm from '@features/expenses/components/ExpenseForm';
import IncomeForm from '@features/income/components/IncomeForm';

import FormDrawer from '@components/FormDrawer';

import { useDrawerStore } from '@stores/drawer';

/** Render-only host for the global expense/income/asset form drawers (state lives in the drawer store). */
const GlobalDrawers = () => {
  const expense = useDrawerStore((state) => state.expense);
  const income = useDrawerStore((state) => state.income);
  const asset = useDrawerStore((state) => state.asset);
  const closeExpenseDrawer = useDrawerStore((state) => state.closeExpenseDrawer);
  const closeIncomeDrawer = useDrawerStore((state) => state.closeIncomeDrawer);
  const closeAssetDrawer = useDrawerStore((state) => state.closeAssetDrawer);
  const setExpenseDirty = useDrawerStore((state) => state.setExpenseDirty);
  const setIncomeDirty = useDrawerStore((state) => state.setIncomeDirty);
  const setAssetDirty = useDrawerStore((state) => state.setAssetDirty);

  return (
    <>
      <FormDrawer
        isOpen={expense.open}
        onClose={closeExpenseDrawer}
        title={expense.editing ? 'Edit Expense' : 'Add New Expense'}
        isDirty={expense.dirty}
      >
        <ExpenseForm
          onExpenseAdded={closeExpenseDrawer}
          editingExpense={expense.editing}
          onCancelEdit={closeExpenseDrawer}
          setIsDirty={setExpenseDirty}
        />
      </FormDrawer>

      <FormDrawer
        isOpen={income.open}
        onClose={closeIncomeDrawer}
        title={income.editing ? 'Edit Income' : 'Add New Income'}
        isDirty={income.dirty}
      >
        <IncomeForm
          onIncomeAdded={closeIncomeDrawer}
          editingIncome={income.editing}
          onCancelEdit={closeIncomeDrawer}
          setIsDirty={setIncomeDirty}
        />
      </FormDrawer>

      <FormDrawer
        isOpen={asset.open}
        onClose={closeAssetDrawer}
        title={asset.editing ? 'Edit Asset' : 'Add New Asset'}
        isDirty={asset.dirty}
      >
        <AssetForm
          onAssetAdded={closeAssetDrawer}
          editingAsset={asset.editing}
          onCancelEdit={closeAssetDrawer}
          setIsDirty={setAssetDirty}
        />
      </FormDrawer>
    </>
  );
};

export default GlobalDrawers;
