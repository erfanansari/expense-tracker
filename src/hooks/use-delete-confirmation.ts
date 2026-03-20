import { useCallback, useState } from 'react';

interface UseDeleteConfirmationOptions {
  onDelete: (id: number) => Promise<void>;
  onError?: (error: unknown) => void;
}

export function useDeleteConfirmation<T extends { id: number }>(options: UseDeleteConfirmationOptions) {
  // States
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Callbacks
  const openModal = useCallback((item: T) => {
    setItemToDelete(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setItemToDelete(null);
    setIsModalOpen(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete.id);

    try {
      await options.onDelete(itemToDelete.id);
      closeModal();
    } catch (err) {
      options.onError?.(err);
    } finally {
      setDeletingId(null);
    }
  }, [itemToDelete, options, closeModal]);

  return {
    itemToDelete,
    isModalOpen,
    deletingId,
    openModal,
    closeModal,
    confirmDelete,
  };
}
