import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  onClick,
}) => {
  const classNames = [
    styles.card,
    styles[`padding-${padding}`],
    className,
  ].filter(Boolean).join(' ');

  return <div className={classNames} onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>{children}</div>;
};

