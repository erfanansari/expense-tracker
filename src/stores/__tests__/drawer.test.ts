import type { Expense } from '@types';

import drawerStore from '../drawer';

const expense = { id: 1, description: 'Coffee' } as Expense;

describe('drawer store', () => {
  beforeEach(() => {
    drawerStore.getState().closeExpenseDrawer();
  });

  it('opens the expense drawer with the editing item and resets dirty', () => {
    drawerStore.getState().setExpenseDirty(true);
    drawerStore.getState().openExpenseDrawer(expense);

    expect(drawerStore.getState().expense).toEqual({ open: true, dirty: false, editing: expense });
  });

  it('tracks dirty state per drawer', () => {
    drawerStore.getState().openExpenseDrawer();
    drawerStore.getState().setExpenseDirty(true);

    expect(drawerStore.getState().expense.dirty).toBe(true);
    expect(drawerStore.getState().income.dirty).toBe(false);
  });

  it('clears editing item and dirty flag on close', () => {
    drawerStore.getState().openExpenseDrawer(expense);
    drawerStore.getState().setExpenseDirty(true);
    drawerStore.getState().closeExpenseDrawer();

    expect(drawerStore.getState().expense).toEqual({ open: false, dirty: false, editing: undefined });
  });
});
