'use client';

import ReactDatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
}

const DatePicker = ({ value, onChange, required }: DatePickerProps) => {
  const selected = value ? new Date(`${value}T00:00:00`) : null;

  const handleChange = (date: Date | null) => {
    if (!date) return;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className="datepicker-wrapper">
      <ReactDatePicker
        selected={selected}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        required={required}
        className="border-border-subtle bg-background text-text-primary focus:border-blue w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none"
        showPopperArrow={false}
        popperPlacement="bottom-start"
        popperProps={{ strategy: 'fixed' }}
      />
    </div>
  );
};

export default DatePicker;
