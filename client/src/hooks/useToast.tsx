import { useState, useCallback } from 'react';
import { Toast } from '../components/ui/Toast/Toast';

export const useToast = () => {
  const [toast, setToast] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'info';
  }>({
    open: false,
    title: '',
  });

  const showToast = useCallback(
    (title: string, description?: string, variant: 'success' | 'error' | 'info' = 'info') => {
      setToast({ open: true, title, description, variant });
    },
    []
  );

  const ToastComponent = () => (
    <Toast
      open={toast.open}
      onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
      title={toast.title}
      description={toast.description}
      variant={toast.variant}
    />
  );

  return { showToast, ToastComponent };
};

