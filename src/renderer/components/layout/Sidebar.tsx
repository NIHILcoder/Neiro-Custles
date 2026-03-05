// src/renderer/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './layout.css';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

interface NavEntry {
  to?: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}

const ICON = (d: string) => (
  <svg className="nav-item__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICONS = {
  home:     ICON('M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z'),
  persona:  ICON('M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0'),
  vault:    ICON('M4 8h12a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM7 8V5a3 3 0 016 0v3'),
  self:     ICON('M12 3c0 1.657-2 3-2 3S8 4.657 8 3a2 2 0 014 0zM4 17c0-3.314 2.686-6 6-6s6 2.686 6 6M2 10h3m13 0h-3'),
  map:      ICON('M1 6l6-3 6 3 6-3v11l-6 3-6-3-6 3V6z'),
  timeline: ICON('M3 10h14M3 5h7m-7 10h7'),
  settings: ICON('M10 13a3 3 0 100-6 3 3 0 000 6zm6.32-1.5a6.97 6.97 0 01.18 1.5c0 .51-.06 1.01-.18 1.5l1.68 1.3-1.5 2.6-2-.8c-.79.6-1.69 1.06-2.68 1.3L11.5 19h-3l-.3-2.1A7.025 7.025 0 015.5 15.6l-2 .8-1.5-2.6L3.7 12.5a6.97 6.97 0 010-3L2 8.2 3.5 5.6l2 .8c.79-.6 1.69-1.06 2.68-1.3L8.5 3h3l.3 2.1c.99.24 1.89.7 2.68 1.3l2-.8 1.5 2.6-1.68 1.3z'),
};

const PRIMARY_NAV: NavEntry[] = [
  { to: '/home',        label: 'Home',        icon: ICONS.home },
  { to: '/persona',     label: 'Persona',     icon: ICONS.persona },
  { to: '/vault',       label: 'Vault',       icon: ICONS.vault },
  { to: '/self-editor', label: 'Self Editor', icon: ICONS.self },
];

const SECONDARY_NAV: NavEntry[] = [
  { label: 'Map',      icon: ICONS.map,      disabled: true, badge: 'soon' },
  { label: 'Timeline', icon: ICONS.timeline, disabled: true, badge: 'soon' },
];

const BOTTOM_NAV: NavEntry[] = [
  { to: '/settings', label: 'Settings', icon: ICONS.settings, disabled: true },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark">N</div>
        <div className="sidebar__logo-info">
          <span className="sidebar__logo-text">Neiro Castles</span>
          <span className="sidebar__logo-version">v6.9.1-beta</span>
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="sidebar__nav">
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.label}
            to={item.to!}
            className={({ isActive }) =>
              ['nav-item', isActive ? 'nav-item--active' : ''].filter(Boolean).join(' ')
            }
          >
            {item.icon}
            <span className="nav-item__label">{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar__section-label">Explore</div>

        {SECONDARY_NAV.map((item) => (
          <div
            key={item.label}
            className="nav-item nav-item--disabled"
            aria-disabled="true"
          >
            {item.icon}
            <span className="nav-item__label">{item.label}</span>
            {item.badge && <span className="nav-item__badge">{item.badge}</span>}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        {BOTTOM_NAV.map((item) =>
          item.disabled ? (
            <div key={item.label} className="nav-item nav-item--disabled" aria-disabled="true">
              {item.icon}
              <span className="nav-item__label">{item.label}</span>
            </div>
          ) : (
            <NavLink key={item.label} to={item.to!} className="nav-item">
              {item.icon}
              <span className="nav-item__label">{item.label}</span>
            </NavLink>
          )
        )}

        {/* Local-First status */}
        <div className="sidebar__status-section">
          <div className="sidebar__local-badge">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5.5 8l2 2 3.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="sidebar__local-info">
              <span className="sidebar__local-title">Local-First</span>
              <span className="sidebar__local-desc">Data stays on device</span>
            </div>
          </div>
          <div className="sidebar__ready-row">
            <span className="sidebar__ready-dot" />
            <span className="sidebar__ready-label">Ready</span>
            <span className="sidebar__atom-count">1,247 atoms</span>
          </div>
        </div>

        {/* Theme */}
        <ThemeSwitcher />

        {/* User */}
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">A</div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">Alex</span>
            <span className="sidebar__user-email">alex@local</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
