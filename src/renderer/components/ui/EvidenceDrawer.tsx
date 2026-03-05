// src/renderer/components/ui/EvidenceDrawer.tsx
// Reusable Evidence Drawer — works for Persona, Home insights, Vault atoms, Beliefs
import React from 'react';
import './ui.css';
import './evidence.css';
import type { EvidenceQuote } from '../../../shared/ipc.js';
import { Drawer } from './Drawer';

interface Props {
  open: boolean;
  onClose: () => void;
  quotes?: EvidenceQuote[];
  why?: string;
  loading?: boolean;
  title?: string;
}

export function EvidenceDrawer({ open, onClose, quotes, why, loading, title = 'Evidence' }: Props) {
  return (
    <Drawer open={open} onClose={onClose} title={title} side="right" width={440}>
      {loading || (!quotes && !why) ? (
        <div className="evidence-loading">
          <div className="skeleton skeleton-line" style={{ width: '70%', height: 10 }} />
          <div className="skeleton skeleton-line" style={{ width: '90%', height: 10 }} />
          <div className="skeleton skeleton-line" style={{ width: '50%', height: 10 }} />
          <div style={{ marginTop: 24 }}>
            <div className="skeleton skeleton-line" style={{ width: '80%', height: 10 }} />
            <div className="skeleton skeleton-line" style={{ width: '60%', height: 10 }} />
          </div>
        </div>
      ) : (
        <>
          {quotes && quotes.length > 0 && (
            <div className="evidence-quotes">
              {quotes.map((q, i) => (
                <div key={i} className="evidence-quote">
                  <div className="evidence-quote__bar" aria-hidden />
                  <div className="evidence-quote__inner">
                    <div className="evidence-quote__source">{q.source} · {q.date}</div>
                    <div className="evidence-quote__snippet">"{q.snippet}"</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {why && (
            <div className="evidence-why">
              <div className="evidence-why__label">Why this matters</div>
              <p className="evidence-why__text">{why}</p>
            </div>
          )}
          {(!quotes || quotes.length === 0) && !why && (
            <p style={{ fontSize: 13, color: 'var(--faint)' }}>No evidence available.</p>
          )}
        </>
      )}
    </Drawer>
  );
}
