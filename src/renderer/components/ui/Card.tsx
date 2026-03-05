// src/renderer/components/ui/Card.tsx
import React from 'react';
import './ui.css';

interface Props {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'overlay';
  interactive?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, variant = 'default', interactive, onClick }: Props) {
  const cls = [
    'card',
    variant !== 'default' && `card--${variant}`,
    interactive && 'card--interactive',
    className,
  ].filter(Boolean).join(' ');
  return (
    <div className={cls} onClick={onClick} role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined}>
      {children}
    </div>
  );
}

Card.Inner  = function CardInner({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={['card__inner', className].filter(Boolean).join(' ')}>{children}</div>;
};

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card__header">{children}</div>;
};

Card.Title = function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="card__title">{children}</div>;
};

Card.Body = function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={['card__body', className].filter(Boolean).join(' ')}>{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card__footer">{children}</div>;
};
