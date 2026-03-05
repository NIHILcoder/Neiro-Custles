// src/renderer/components/ui/Drawer.tsx
import React, { useEffect } from 'react';
import './ui.css';
import { Button } from './Button';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'right' | 'left';
  children?: React.ReactNode;
  width?: number | string;
}

export function Drawer({ open, onClose, title, side = 'right', children, width }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const drawerCls = ['drawer', side === 'left' && 'drawer--left'].filter(Boolean).join(' ');

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} aria-hidden />
      <div
        className={drawerCls}
        role="dialog"
        aria-modal
        aria-label={title}
        style={width ? { width } : undefined}
      >
        <div className="drawer__header">
          <span className="drawer__title">{title}</span>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close drawer">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </Button>
        </div>
        <div className="drawer__body">{children}</div>
      </div>
    </>
  );
}
