import React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import styles from './Toast.module.css';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({
  open,
  onOpenChange,
  title,
  description,
  variant = 'info',
}) => {
  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      className={`${styles.toast} ${styles[variant]}`}
      dir="rtl"
    >
      <ToastPrimitive.Title className={styles.title}>{title}</ToastPrimitive.Title>
      {description && (
        <ToastPrimitive.Description className={styles.description}>
          {description}
        </ToastPrimitive.Description>
      )}
      <ToastPrimitive.Close className={styles.close}>✕</ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

