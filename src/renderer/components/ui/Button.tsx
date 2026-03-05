// src/renderer/components/ui/Button.tsx
import React, { useCallback } from 'react';
import './ui.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: React.ReactNode;
  as?: 'button' | 'a';
  href?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  disabled,
  children,
  onClick,
  ...rest
}: Props) {
  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    className,
  ].filter(Boolean).join(' ');

  // Track mouse position for ripple effect
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--ripple-x', `${x}%`);
    btn.style.setProperty('--ripple-y', `${y}%`);
    onClick?.(e);
  }, [onClick]);

  return (
    <button className={cls} disabled={disabled || loading} onClick={handleClick} {...rest}>
      {loading && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="btn-spinner">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="10 20" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </svg>
      )}
      {children}
    </button>
  );
}
