import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '../Button/Button';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  children,
  footer,
}) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content className={styles.content} dir="rtl">
          <DialogPrimitive.Title className={styles.title}>
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className={styles.description}>
            {children}
          </DialogPrimitive.Description>
          {footer && <div className={styles.footer}>{footer}</div>}
          <DialogPrimitive.Close asChild>
            <button className={styles.closeButton} aria-label="סגור">
              ✕
            </button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

