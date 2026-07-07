import toastStore from '../toast';

describe('toast store', () => {
  beforeEach(() => {
    toastStore.setState({ toasts: [] });
  });

  it('adds a toast with the given message and type', () => {
    toastStore.getState().showToast('Saved!', 'success');

    const { toasts } = toastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ message: 'Saved!', type: 'success' });
  });

  it('defaults the type to info', () => {
    toastStore.getState().showToast('Heads up');

    expect(toastStore.getState().toasts[0].type).toBe('info');
  });

  it('removes a toast by id', () => {
    toastStore.getState().showToast('One');
    toastStore.getState().showToast('Two');
    const [first] = toastStore.getState().toasts;

    toastStore.getState().closeToast(first.id);

    expect(toastStore.getState().toasts).toHaveLength(1);
    expect(toastStore.getState().toasts[0].message).toBe('Two');
  });
});
