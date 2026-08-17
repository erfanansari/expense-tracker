import { useState } from 'react';

import AmountInput from '..';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render, screen } from '@/__tests__/test-utils';

const Harness = ({ onChange = jest.fn() }: { onChange?: (value: number) => void }) => {
  const [value, setValue] = useState(0);

  return (
    <AmountInput
      aria-label="Amount"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
};

/** Simulate a key press as a non-Latin layout reports it: physical code, foreign character. */
const pressForeignKey = (input: HTMLElement, code: string, key: string) => fireEvent.keyDown(input, { code, key });

describe('AmountInput', () => {
  it('expands shorthand typed on a Latin layout', async () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Amount'), '900k');

    expect(onChange).toHaveBeenLastCalledWith(900_000);
  });

  it('expands shorthand from the physical key when the layout emits a non-Latin character', async () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByLabelText('Amount');

    // Persian layout: the k/m/b/t keys emit ن/پ/ذ/ف.
    await userEvent.type(input, '900');
    pressForeignKey(input, 'KeyK', 'ن');

    expect(input).toHaveValue('900k');
    expect(onChange).toHaveBeenLastCalledWith(900_000);
  });

  it('maps every shorthand key position, not just k', async () => {
    for (const [code, key, expected] of [
      ['KeyM', 'پ', 2_000_000],
      ['KeyB', 'ذ', 2_000_000_000],
      ['KeyT', 'ف', 2_000_000_000_000],
    ] as const) {
      const onChange = jest.fn();
      const { unmount } = render(<Harness onChange={onChange} />);
      const input = screen.getByLabelText('Amount');

      await userEvent.type(input, '2');
      pressForeignKey(input, code, key);

      expect(onChange).toHaveBeenLastCalledWith(expected);
      unmount();
    }
  });

  it('leaves Latin layouts alone so their own key positions win (Dvorak)', async () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByLabelText('Amount');

    await userEvent.type(input, '900');
    // Dvorak puts 'v' on the KeyK position — a Latin character, so we must not
    // hijack it into a 'k'. The keystroke filter then rejects it as usual.
    fireEvent.keyDown(input, { code: 'KeyK', key: 'v' });

    expect(input).toHaveValue('900');
    expect(onChange).toHaveBeenLastCalledWith(900);
  });

  it('ignores shorthand key positions used as shortcut modifiers', async () => {
    render(<Harness />);
    const input = screen.getByLabelText('Amount');

    await userEvent.type(input, '900');
    fireEvent.keyDown(input, { code: 'KeyK', key: 'ن', metaKey: true });

    expect(input).toHaveValue('900');
  });

  it('inserts the shorthand at the caret rather than blindly appending', async () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByLabelText('Amount') as HTMLInputElement;

    await userEvent.type(input, '900');
    input.setSelectionRange(1, 3); // select the trailing "00"
    pressForeignKey(input, 'KeyK', 'ن');

    expect(input).toHaveValue('9k');
    expect(onChange).toHaveBeenLastCalledWith(9_000);
  });
});
