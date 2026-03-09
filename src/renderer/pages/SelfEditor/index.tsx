// src/renderer/pages/SelfEditor/index.tsx
import React, { useState, useEffect, useMemo } from 'react';
import '../pages.css';
import type { Belief, BeliefCategory } from '../../../shared/ipc.js';
import { Badge }  from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card }   from '../../components/ui/Card';
import { Input }  from '../../components/ui/Input';
import { EvidenceDrawer } from '../../components/ui/EvidenceDrawer';

/* ── Category constants ─────────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<BeliefCategory, React.ReactNode> = {
  value:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3C6.5 3 4 4.5 4 7.5S8 13 8 13s4-2.5 4-5.5S9.5 3 8 3z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  boundary: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3h10v10H3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeDasharray="3 2"/></svg>,
  pattern:  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1"/></svg>,
  voice:    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 5v4M11 4v6M3 7v2M13 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  goal:     <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>,
};

const CATEGORIES: BeliefCategory[] = ['value', 'boundary', 'pattern', 'voice', 'goal'];

const CATEGORY_LABELS: Record<BeliefCategory, string> = {
  value:    'Values',
  boundary: 'Boundaries',
  pattern:  'Patterns',
  voice:    'Voice',
  goal:     'Goals',
};

const STATUS_COLOR: Record<string, 'success' | 'warning'> = {
  confirmed:  'success',
  hypothesis: 'warning',
};

/* ── SVG icons ──────────────────────────────────────────────────────────── */

const SearchIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const ClockIcon = (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const SourceIcon = (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M5 7h6M5 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

/* ── Component ──────────────────────────────────────────────────────────── */

export function SelfEditor() {
  const [beliefs, setBeliefs]           = useState<Belief[]>([]);
  const [selected, setSelected]         = useState<Belief | null>(null);

  // Filters
  const [activeCategories, setActiveCategories] = useState<Set<BeliefCategory>>(new Set());
  const [searchQuery, setSearchQuery]           = useState('');
  const [statusFilter, setStatusFilter]         = useState<'all' | 'confirmed' | 'hypothesis'>('all');
  const [personaFilter, setPersonaFilter]       = useState(false);

  useEffect(() => {
    window.neiro.self.listBeliefs().then(setBeliefs);
  }, []);

  /* ── Derived data ──────────────────────────────────── */

  const confirmedCount  = beliefs.filter(b => b.status === 'confirmed').length;
  const hypothesisCount = beliefs.filter(b => b.status === 'hypothesis').length;
  const inPersonaCount  = beliefs.filter(b => b.inPersona).length;

  const categoryStats = useMemo(() => {
    const stats: Record<BeliefCategory, { total: number; confirmed: number; hypothesis: number; avgConfidence: number }> = {} as any;
    for (const cat of CATEGORIES) {
      const catBeliefs = beliefs.filter(b => b.category === cat);
      stats[cat] = {
        total: catBeliefs.length,
        confirmed: catBeliefs.filter(b => b.status === 'confirmed').length,
        hypothesis: catBeliefs.filter(b => b.status === 'hypothesis').length,
        avgConfidence: catBeliefs.length > 0
          ? Math.round(catBeliefs.reduce((s, b) => s + b.confidence, 0) / catBeliefs.length * 100)
          : 0,
      };
    }
    return stats;
  }, [beliefs]);

  const filtered = useMemo(() => {
    return beliefs.filter(b => {
      if (activeCategories.size > 0 && !activeCategories.has(b.category)) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (personaFilter && !b.inPersona) return false;
      if (searchQuery && !b.statement.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [beliefs, activeCategories, statusFilter, personaFilter, searchQuery]);

  /* ── Handlers ──────────────────────────────────────── */

  function toggleCategory(cat: BeliefCategory) {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function openDetail(b: Belief) {
    setSelected(b);
  }

  /* ── Render ────────────────────────────────────────── */

  return (
    <div className="self-dashboard">
      <div className="page-scroll-wrap">

        {/* ── Header ───────────────────────────────────────── */}
        <header className="page-header">
          <div className="page-header__date">SELF MODEL</div>
          <div className="page-header__row">
            <div>
              <h1 className="page-title">Identity Dashboard</h1>
              <p className="page-subtitle">
                {confirmedCount} confirmed · {hypothesisCount} hypotheses · {inPersonaCount} in persona
              </p>
            </div>
            <Button variant="primary" size="sm" className="self-new-btn">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              New Belief
            </Button>
          </div>
        </header>

        {/* ── Metric cards row ─────────────────────────────── */}
        <section className="self-metrics">
          {CATEGORIES.map(cat => {
            const s = categoryStats[cat];
            const isActive = activeCategories.has(cat);
            return (
              <Card
                key={cat}
                interactive
                variant={isActive ? 'elevated' : 'default'}
                className={`self-metric-card ${isActive ? 'self-metric-card--active' : ''} ${s.total === 0 ? 'self-metric-card--empty' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                <Card.Inner>
                  <div className="self-metric-card__top">
                    <span className="self-metric-card__icon">{CATEGORY_ICONS[cat]}</span>
                    <span className="self-metric-card__count">{s.total}</span>
                  </div>
                  <Card.Title>{CATEGORY_LABELS[cat]}</Card.Title>
                  <div className="self-metric-card__bar">
                    <div className="confidence-bar">
                      <div className="confidence-bar__fill" style={{ width: `${s.avgConfidence}%` }} />
                    </div>
                  </div>
                  <div className="self-metric-card__stats">
                    {s.confirmed > 0 && <Badge color="success">{s.confirmed} confirmed</Badge>}
                    {s.hypothesis > 0 && <Badge color="warning">{s.hypothesis} hypothesis</Badge>}
                  </div>
                </Card.Inner>
              </Card>
            );
          })}
        </section>

        {/* ── Controls bar ─────────────────────────────────── */}
        <section className="self-controls">
          <div className="self-controls__search">
            <Input
              icon={SearchIcon}
              placeholder="Search beliefs..."
              size="sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="self-controls__filters">
            {(['all', 'confirmed', 'hypothesis'] as const).map(s => (
              <button
                key={s}
                className={`self-status-pill ${statusFilter === s ? 'self-status-pill--active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : s === 'confirmed' ? 'Confirmed' : 'Hypothesis'}
              </button>
            ))}
          </div>
          <div className="self-controls__persona-filter">
            <span>In Persona only</span>
            <button
              className={`toggle-switch ${personaFilter ? 'toggle-switch--on' : ''}`}
              onClick={() => setPersonaFilter(v => !v)}
              role="switch"
              aria-checked={personaFilter}
            >
              <span className="toggle-switch__thumb" />
            </button>
          </div>
        </section>

        {/* ── Belief card grid ─────────────────────────────── */}
        <section className="self-grid">
          {filtered.length === 0 && (
            <div className="self-grid__empty">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2"/>
              </svg>
              <span>No beliefs match your filters</span>
            </div>
          )}

          {filtered.map(b => (
            <Card
              key={b.id}
              interactive
              className="belief-tile"
              onClick={() => openDetail(b)}
            >
              <Card.Inner>
                <div className="belief-tile__header">
                  <Badge color="outline">
                    {CATEGORY_ICONS[b.category]}
                    {CATEGORY_LABELS[b.category]}
                  </Badge>
                  <Badge color={STATUS_COLOR[b.status]}>
                    {b.status === 'confirmed' ? 'Confirmed' : 'Hypothesis'}
                  </Badge>
                </div>

                <div className="belief-tile__confidence">
                  <div className="confidence-bar">
                    <div className="confidence-bar__fill" style={{ width: `${Math.round(b.confidence * 100)}%` }} />
                  </div>
                  <span className="belief-tile__confidence-label">
                    {Math.round(b.confidence * 100)}%
                  </span>
                </div>

                <Card.Body>
                  <p className="belief-tile__statement">{b.statement}</p>
                </Card.Body>

                <Card.Footer>
                  <div className="belief-tile__footer">
                    <span className="belief-tile__meta">{SourceIcon}{b.sourceCount} sources</span>
                    <span className="belief-tile__meta">{ClockIcon}Since {b.createdAt}</span>
                    {b.inPersona && <Badge color="accent">In Persona</Badge>}
                  </div>
                </Card.Footer>
              </Card.Inner>
            </Card>
          ))}
        </section>
      </div>

      <EvidenceDrawer
        open={false}
        onClose={() => {}}
        quotes={selected?.evidence}
        why={selected ? `Evidence underpinning: "${selected.statement}"` : undefined}
      />
    </div>
  );
}
