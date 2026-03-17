import { useState } from 'react';

import { useExchangeRate } from '@hooks/use-exchange-rate';

interface UseExchangeRateFormOptions {
  /** The exchange rate stored on the entity being edited (e.g. editingIncome?.exchangeRateUsed) */
  editingRate?: number | null;
}

export function useExchangeRateForm(options: UseExchangeRateFormOptions = {}) {
  const { data: rateData, isLoading: isFetchingRate } = useExchangeRate();
  const fetchedRate = rateData?.usd ? parseInt(rateData.usd.value, 10) : 0;

  // User-overridden exchange rate; null means "use default"
  const [userRate, setUserRate] = useState<number | null>(null);

  // Derived exchange rate: user override > editing entity rate > fetched rate
  const exchangeRate = userRate ?? options.editingRate ?? fetchedRate;

  const resetUserRate = () => setUserRate(null);

  return {
    exchangeRate,
    isFetchingRate,
    userRate,
    setUserRate,
    resetUserRate,
    fetchedRate,
  };
}
