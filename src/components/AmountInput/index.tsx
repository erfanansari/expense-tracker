'use client';

import { useState } from 'react';

import { isPlausibleAmountInput, parseShorthandNumber } from '@utils/format';

interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

// Shorthand suffixes keyed by physical key position (KeyboardEvent.code), which
// is layout-independent. A non-Latin layout — Persian, Arabic, Russian — puts a
// letter on the K key that means nothing in an amount field ("ن" on fa), so the
// keystroke filter drops it and the character never appears. Reading the physical
// key lets "900k" work on any layout without enumerating each one's alphabet.
const PHYSICAL_KEY_SHORTHAND: Record<string, string> = {
  KeyK: 'k',
  KeyM: 'm',
  KeyB: 'b',
  KeyT: 't',
};

/**
 * A numeric input that accepts shorthand notation (4k, 3.2m, 1.5b, 2t).
 * On each keystroke the parsed value is forwarded to onChange so bidirectional
 * conversions stay live. On blur the display is normalised to the resolved number.
 */
const AmountInput = ({ value, onChange, onBlur, onKeyDown, ...props }: AmountInputProps) => {
  const [displayValue, setDisplayValue] = useState(value === 0 ? '' : String(value));
  const [prevValue, setPrevValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // React-idiomatic derived state: sync display when the parent pushes a new value
  // (e.g. bidirectional currency conversion) while this field is not focused.
  // Calling setState during render triggers an immediate re-render before paint.
  // isFocused is plain state (not a ref) so it is safe to read here.
  if (prevValue !== value) {
    setPrevValue(value);
    if (!isFocused) {
      setDisplayValue(value === 0 ? '' : String(value));
    }
  }

  const handleFocus = () => setIsFocused(true);

  const applyInput = (raw: string) => {
    // Reject keystrokes that could never form a valid amount (e.g. letters)
    // instead of accepting them and reverting on blur.
    if (!isPlausibleAmountInput(raw)) return;

    setDisplayValue(raw);

    if (raw.trim() === '') {
      onChange(0);
      return;
    }

    const parsed = parseShorthandNumber(raw);
    if (parsed !== null) {
      onChange(parsed);
    }
    // If null (partial / mid-shorthand e.g. user just typed "k"), keep the
    // previous numeric value so the form state stays valid while still typing.
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => applyInput(e.target.value);

  // Translate the k/m/b/t key positions into their shorthand letters when the
  // active layout would otherwise emit a non-Latin character. Latin layouts fall
  // through untouched, so alternative ones (Dvorak, AZERTY) keep their own key
  // positions — there the K key already reports e.key === 'k'.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;

    const suffix = PHYSICAL_KEY_SHORTHAND[e.code];
    if (!suffix || /^[a-z]$/i.test(e.key)) return;

    const input = e.currentTarget;
    if (input.readOnly) return;

    e.preventDefault();
    const start = input.selectionStart ?? displayValue.length;
    const end = input.selectionEnd ?? start;
    applyInput(displayValue.slice(0, start) + suffix + displayValue.slice(end));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const raw = displayValue.trim();

    if (raw === '') {
      onChange(0);
      setDisplayValue('');
    } else {
      const parsed = parseShorthandNumber(raw);
      if (parsed !== null) {
        onChange(parsed);
        setDisplayValue(parsed === 0 ? '' : String(parsed));
      } else {
        // Revert display to the last valid value held by parent
        setDisplayValue(value === 0 ? '' : String(value));
      }
    }

    onBlur?.(e);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

export default AmountInput;
