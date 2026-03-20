import { useState } from 'react';

import { useExchangeRate } from '@hooks/use-exchange-rate';

interface UseExchangeRateFormOptions {
  /** The exchange rate stored on the entity being edited (e.g. editingIncome?.exchangeRateUsed) */
  editingRate?: number | null;
}

export function useExchangeRateForm(options: UseExchangeRateFormOptions = {}) {
  // Queries
  const { data: rateData, isLoading: isFetchingRate } = useExchangeRate();

  // States
  const [userRate, setUserRate] = useState<number | null>(null);

  // Variables
  const fetchedRate = rateData?.usd ? parseInt(rateData.usd.value, 10) : 0;
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
