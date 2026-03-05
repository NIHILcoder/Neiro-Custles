// src/renderer/components/ui/Input.tsx
import React from 'react';
import './ui.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  wrapClassName?: string;
}

export function Input({ icon, size = 'md', className, wrapClassName, ...rest }: Props) {
  const inputCls = [
    'input',
    size !== 'md' && `input--${size}`,
    className,
  ].filter(Boolean).join(' ');

  if (!icon) return <input className={inputCls} {...rest} />;

  return (
    <div className={['input-wrap', 'input-wrap--has-icon', wrapClassName].filter(Boolean).join(' ')}>
      <span className="input-wrap__icon" aria-hidden>{icon}</span>
      <input className={inputCls} {...rest} />
    </div>
  );
}
