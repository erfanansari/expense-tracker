'use client';

import { useState } from 'react';

import { parseShorthandNumber } from '@utils/format';

interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

/**
 * A numeric input that accepts shorthand notation (4k, 3.2m, 1.5b, 2t).
 * On each keystroke the parsed value is forwarded to onChange so bidirectional
 * conversions stay live. On blur the display is normalised to the resolved number.
 */
const AmountInput = ({ value, onChange, onBlur, ...props }: AmountInputProps) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
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
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

export default AmountInput;
