import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styles from './ActionsMenu.module.css';

export interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ActionsMenuProps {
  actions: ActionItem[];
  trigger?: React.ReactNode;
}

export const ActionsMenu: React.FC<ActionsMenuProps> = ({
  actions,
  trigger,
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger || (
          <button className={styles.trigger} aria-label="פעולות">
            ⋯
          </button>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} sideOffset={5}>
          {actions.map((action, index) => (
            <DropdownMenu.Item
              key={index}
              className={`${styles.item} ${action.variant === 'danger' ? styles.danger : ''}`}
              onSelect={() => {
                if (!action.disabled) {
                  action.onClick();
                }
              }}
              disabled={action.disabled}
            >
              {action.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

