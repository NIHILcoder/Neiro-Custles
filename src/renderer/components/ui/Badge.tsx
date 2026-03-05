// src/renderer/components/ui/Badge.tsx
import React from 'react';
import './ui.css';

type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';

interface Props {
  color?: Color;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ color = 'default', dot, children, className }: Props) {
  const cls = [
    'badge',
    `badge--${color}`,
    dot && 'badge--dot',
    className,
  ].filter(Boolean).join(' ');
  return <span className={cls}>{children}</span>;
}
