// src/renderer/components/layout/Topbar.tsx
import React, { useEffect, useRef } from 'react';
import './layout.css';
import { Button } from '../ui/Button';

export function Topbar() {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const shortcut = isMac ? '⌘K' : 'Ctrl K';

  return (
    <header className="topbar">
      {/* Global search */}
      <div className="topbar__search">
        <div
          className="topbar__search-inner"
          role="button"
          tabIndex={0}
          aria-label="Global search"
          onClick={() => {/* TODO: open command palette */}}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') {/* open */} }}
        >
          <svg className="topbar__search-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span className="topbar__search-text">Search anything…</span>
          <kbd className="topbar__search-shortcut">{shortcut}</kbd>
        </div>
      </div>

      <div className="topbar__spacer" />

      {/* Status indicator */}
      <div className="topbar__status">
        <span className="topbar__status-dot" />
        <span>Local Only</span>
      </div>

      {/* Import button */}
      <Button variant="secondary" size="sm">
        Import
      </Button>
    </header>
  );
}
