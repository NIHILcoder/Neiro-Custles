// src/renderer/components/layout/Layout.tsx
import React from 'react';
import './layout.css';
import { Sidebar } from './Sidebar';
import { Topbar }  from './Topbar';
import { PageTransition } from './PageTransition';

interface Props {
  children: React.ReactNode;
}

export function Layout({ children }: Props) {
  return (
    <div className="shell">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="page-content">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

