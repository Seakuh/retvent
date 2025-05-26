import React, { ReactNode } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon: Icon, children, footer, className = '' }) => {
  return (
    <div className={`${styles.card} ${className}`}>
      <header className={styles.header}>
        {Icon && (
          <div className={styles.icon}>
            <Icon size={20} />
          </div>
        )}
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
};

export default Card;