import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  }, [router]);

  return { user, loading, error, logout, refetch: fetchUser };
}
