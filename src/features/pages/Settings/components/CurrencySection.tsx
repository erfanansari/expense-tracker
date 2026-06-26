'use client';

import { Coins } from 'lucide-react';

import Select from '@components/Select';

import { useCurrencyPreferences } from '@hooks/use-currency-preferences';

import { CURRENCIES } from '@/constants/currencies';

const SECONDARY_DISABLED = 'none';

const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} (${c.label})` }));

const CurrencySection = () => {
  const { prefs, isLoading, mutate, isMutating } = useCurrencyPreferences();

  // Secondary options exclude the current primary (no point showing it twice)
  // and add a "Disabled" choice.
  const secondaryOptions = [
    { value: SECONDARY_DISABLED, label: 'Disabled' },
    ...CURRENCY_OPTIONS.filter((o) => o.value !== prefs.primaryCurrency),
  ];

  const handlePrimaryChange = (value: string) => {
    // If the new primary equals the secondary, drop the secondary.
    const secondary = prefs.secondaryCurrency === value ? null : prefs.secondaryCurrency;
    mutate({ primaryCurrency: value, secondaryCurrency: secondary });
  };

  const handleSecondaryChange = (value: string) => {
    mutate({ secondaryCurrency: value === SECONDARY_DISABLED ? null : value });
  };

  return (
    <div className="border-border-subtle bg-background rounded-xl border shadow-sm">
      <div className="border-border-subtle border-b p-6">
        <div className="flex items-center gap-3">
          <div className="border-border-subtle bg-background-secondary rounded-lg border p-2">
            <Coins className="text-text-secondary h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-text-primary text-lg font-semibold">Currency</h2>
            <p className="text-text-muted text-sm">
              Choose your primary currency and an optional secondary shown beneath it.
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">Primary currency</label>
            <Select
              value={prefs.primaryCurrency}
              onChange={handlePrimaryChange}
              options={CURRENCY_OPTIONS}
              disabled={isLoading || isMutating}
            />
            <p className="text-text-muted mt-1.5 text-xs">The dominant value shown everywhere.</p>
          </div>

          <div>
            <label className="text-text-secondary mb-1.5 block text-sm font-medium">Secondary currency</label>
            <Select
              value={prefs.secondaryCurrency ?? SECONDARY_DISABLED}
              onChange={handleSecondaryChange}
              options={secondaryOptions}
              disabled={isLoading || isMutating}
            />
            <p className="text-text-muted mt-1.5 text-xs">
              A muted caption beneath the primary. Choose “Disabled” to hide it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySection;
