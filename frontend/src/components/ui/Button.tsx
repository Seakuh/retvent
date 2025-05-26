import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {LeftIcon && <LeftIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className={styles.iconLeft} />}
      {children}
      {RightIcon && <RightIcon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className={styles.iconRight} />}
    </button>
  );
};

export default Button;