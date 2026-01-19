import { useCallback, useState } from 'react';

interface UseDrawerReturn {
  isOpen: boolean;
  isDirty: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setIsDirty: (dirty: boolean) => void;
}

export default function useDrawer(): UseDrawerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const openDrawer = useCallback(() => {
    setIsOpen(true);
    setIsDirty(false);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setIsDirty(false);
  }, []);

  return {
    isOpen,
    isDirty,
    openDrawer,
    closeDrawer,
    setIsDirty,
  };
}
