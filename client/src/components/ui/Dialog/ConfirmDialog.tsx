import React from 'react';
import { Dialog } from './Dialog';
import { Button } from '../Button/Button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'default';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  onConfirm,
  variant = 'default',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={() => onOpenChange(false)}>
        {cancelLabel}
      </Button>
      <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} footer={footer}>
      {message}
    </Dialog>
  );
};

