// src/renderer/components/ui/ThemeSwitcher.tsx
import React, { useEffect, useState } from 'react';

const THEMES = [
  { id: 'violet', label: 'Violet', color: '#7c5cfc' },
  { id: 'rose',   label: 'Rose',   color: '#e88faf'  },
] as const;

type ThemeId = (typeof THEMES)[number]['id'];

function getStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem('neiro-theme');
    if (stored === 'violet' || stored === 'rose') return stored;
  } catch { /* noop */ }
  return 'violet';
}

function applyTheme(id: ThemeId) {
  const html = document.documentElement;
  // Enable smooth theme cross-fade
  html.classList.add('theme-transitioning');
  html.setAttribute('data-theme', id);
  try { localStorage.setItem('neiro-theme', id); } catch { /* noop */ }
  // Remove transition class after animation completes
  setTimeout(() => html.classList.remove('theme-transitioning'), 600);
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Apply stored theme on mount
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  const cycle = () => {
    setTheme((prev) => {
      const idx = THEMES.findIndex((t) => t.id === prev);
      return THEMES[(idx + 1) % THEMES.length].id;
    });
  };

  const current = THEMES.find((t) => t.id === theme)!;

  return (
    <button
      className="theme-switcher"
      onClick={cycle}
      aria-label={`Theme: ${current.label}. Click to switch`}
      title={`Theme: ${current.label}`}
    >
      <span className="theme-switcher__orb" style={{ background: current.color }} />
      <span className="theme-switcher__label">{current.label}</span>
      <svg className="theme-switcher__icon" width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
