import { act, renderHook } from '@testing-library/react';

import { useGettingStartedFlow } from '../use-getting-started-flow';
import type { StepCounts } from '../use-getting-started-flow';

function setup(initial: StepCounts) {
  return renderHook(({ counts }: { counts: StepCounts }) => useGettingStartedFlow(counts), {
    initialProps: { counts: initial },
  });
}

const flushRaf = async () => {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  });
};

describe('useGettingStartedFlow', () => {
  beforeEach(() => localStorage.clear());

  it('opens by default for a fresh browser, collapsed when remembered', async () => {
    const { result } = setup({ expense: 0, income: 0, asset: 0 });
    await flushRaf();
    expect(result.current.state.kind).toBe('open');

    localStorage.setItem('kharji-getting-started-collapsed', '1');
    const { result: second } = setup({ expense: 0, income: 0, asset: 0 });
    await flushRaf();
    expect(second.current.state.kind).toBe('collapsed');
  });

  it('does NOT fire a chain on initial hydration with existing data', async () => {
    const { result, rerender } = setup({ expense: undefined, income: undefined, asset: undefined });
    await flushRaf();
    rerender({ counts: { expense: 5, income: 2, asset: 1 } });
    expect(result.current.state.kind).toBe('open'); // no suggestion, no completion
  });

  it('fires a suggestion when a count crosses 0 to 1 between loaded snapshots', async () => {
    const { result, rerender } = setup({ expense: 0, income: 0, asset: 0 });
    await flushRaf();
    rerender({ counts: { expense: 1, income: 0, asset: 0 } });
    expect(result.current.state).toEqual({ kind: 'suggesting', completed: 'expense', next: 'income' });
  });

  it('suggests the next incomplete step, wrapping past completed ones', async () => {
    const { rerender, result } = setup({ expense: 0, income: 1, asset: 0 });
    await flushRaf();
    rerender({ counts: { expense: 1, income: 1, asset: 0 } });
    expect(result.current.state).toEqual({ kind: 'suggesting', completed: 'expense', next: 'asset' });
  });

  it('enters completing when the last step finishes live', async () => {
    const { rerender, result } = setup({ expense: 1, income: 1, asset: 0 });
    await flushRaf();
    rerender({ counts: { expense: 1, income: 1, asset: 1 } });
    expect(result.current.state.kind).toBe('completing');
  });

  it('completing retires to finished after the celebration', async () => {
    jest.useFakeTimers();
    try {
      const { rerender, result } = setup({ expense: 1, income: 1, asset: 0 });
      rerender({ counts: { expense: 1, income: 1, asset: 1 } });
      expect(result.current.state.kind).toBe('completing');
      act(() => jest.advanceTimersByTime(6100));
      expect(result.current.state.kind).toBe('finished');
    } finally {
      jest.useRealTimers();
    }
  });

  it('later() collapses a suggestion and remembers the collapse', async () => {
    const { rerender, result } = setup({ expense: 0, income: 0, asset: 0 });
    await flushRaf();
    rerender({ counts: { expense: 1, income: 0, asset: 0 } });
    act(() => result.current.later());
    expect(result.current.state.kind).toBe('collapsed');
    expect(localStorage.getItem('kharji-getting-started-collapsed')).toBe('1');
  });

  it('toggle() flips collapsed and open, persisting the choice', async () => {
    const { result } = setup({ expense: 0, income: 0, asset: 0 });
    await flushRaf();
    act(() => result.current.toggle());
    expect(result.current.state.kind).toBe('collapsed');
    expect(localStorage.getItem('kharji-getting-started-collapsed')).toBe('1');
    act(() => result.current.toggle());
    expect(result.current.state.kind).toBe('open');
  });
});
