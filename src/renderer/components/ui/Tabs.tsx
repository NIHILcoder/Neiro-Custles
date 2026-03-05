// src/renderer/components/ui/Tabs.tsx
import React, { useState } from 'react';
import './ui.css';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

interface Props {
  items: TabItem[];
  defaultKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: 'line' | 'pill';
  className?: string;
}

export function Tabs({ items, defaultKey, activeKey: controlledKey, onChange, variant = 'line', className }: Props) {
  const [internalKey, setInternalKey] = useState(defaultKey ?? items[0]?.key);
  const active = controlledKey ?? internalKey;

  function handleSelect(key: string) {
    setInternalKey(key);
    onChange?.(key);
  }

  const listCls = ['tabs__list', variant === 'pill' && 'tabs__list--pill'].filter(Boolean).join(' ');

  return (
    <div className={['tabs', className].filter(Boolean).join(' ')}>
      <div className={listCls} role="tablist">
        {items.map((item) => (
          <button
            key={item.key}
            role="tab"
            aria-selected={active === item.key}
            className={['tabs__tab', active === item.key && 'tabs__tab--active'].filter(Boolean).join(' ')}
            onClick={() => handleSelect(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.key}
          role="tabpanel"
          className={['tabs__panel', active !== item.key && 'tabs__panel--hidden'].filter(Boolean).join(' ')}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
