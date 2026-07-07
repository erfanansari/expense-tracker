'use client';

import { useEffect } from 'react';

import { useAuth } from '@hooks/use-auth';
import { useCurrencyPreferences } from '@hooks/use-currency-preferences';

import currencyStore from '@stores/currency';

/**
 * Syncs server-side currency preferences (React Query) into the currency store.
 * Optimistic updates flow through automatically: useCurrencyPreferences writes
 * the query cache in onMutate, which re-renders this component and re-syncs.
 */
const CurrencyHydrator = () => {
  // Only fetch prefs once authenticated — this renders app-wide (including
  // auth pages), so gating avoids firing authed requests on the login screen.
  const { user } = useAuth();
  const { prefs, isLoading } = useCurrencyPreferences(!!user);

  useEffect(() => {
    if (!user || isLoading) return;
    currencyStore.getState().setPreferences(prefs);
  }, [user, isLoading, prefs]);

  return null;
};

export default CurrencyHydrator;
