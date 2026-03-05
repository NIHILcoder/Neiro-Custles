// src/renderer/pages/SelfEditor/index.tsx
import React, { useState, useEffect } from 'react';
import '../pages.css';
import type { Belief, BeliefCategory } from '../../../shared/ipc.js';
import { Tabs }   from '../../components/ui/Tabs';
import { Badge }  from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EvidenceDrawer } from '../../components/ui/EvidenceDrawer';

const CATEGORY_ICONS: Record<BeliefCategory, React.ReactNode> = {
  value: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3C6.5 3 4 4.5 4 7.5S8 13 8 13s4-2.5 4-5.5S9.5 3 8 3z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  boundary: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  pattern: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1"/></svg>,
  voice: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 5v4M11 4v6M3 7v2M13 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  goal: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>,
};

const STATUS_COLOR: Record<string, 'success' | 'warning'> = {
  confirmed: 'success',
  hypothesis: 'warning',
};

const CATEGORIES: BeliefCategory[] = ['value', 'boundary', 'pattern', 'voice', 'goal'];

export function SelfEditor() {
  const [beliefs, setBeliefs]       = useState<Belief[]>([]);
  const [selected, setSelected]     = useState<Belief | null>(null);
  const [draft, setDraft]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [activeTab, setActiveTab]   = useState<BeliefCategory>('value');
  const [importance, setImportance] = useState(70);
  const [useInPersona, setUseInPersona] = useState(true);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  useEffect(() => {
    window.neiro.self.listBeliefs().then(setBeliefs);
  }, []);

  function handleSelect(b: Belief) {
    setSelected(b);
    setDraft(b.statement);
    setImportance(Math.round(b.confidence * 100));
    setUseInPersona(b.inPersona);
  }

  async function handleSave() {
    if (!selected || saving) return;
    setSaving(true);
    try {
      const updated = await window.neiro.self.updateBelief(selected.id, { statement: draft });
      setBeliefs((prev) => prev.map((b) => b.id === updated.id ? updated : b));
      setSelected(updated);
    } finally {
      setSaving(false);
    }
  }

  const confirmedCount = beliefs.filter(b => b.status === 'confirmed').length;
  const hypothesisCount = beliefs.filter(b => b.status === 'hypothesis').length;

  const tabItems = CATEGORIES.map((cat) => {
    const catBeliefs = beliefs.filter((b) => b.category === cat);
    return {
      key: cat,
      label: (
        <span className="self-tab-label">
          {CATEGORY_ICONS[cat]}
          <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}s</span>
          <span className="self-tab-count">{catBeliefs.length}</span>
        </span>
      ),
      content: (
        <div className="self-list">
          {catBeliefs.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--faint)', padding: 'var(--space-4) 0' }}>
              No {cat} beliefs recorded yet.
            </div>
          )}
          {catBeliefs.map((b) => (
            <div
              key={b.id}
              className={['belief-card', selected?.id === b.id && 'belief-card--active'].filter(Boolean).join(' ')}
              onClick={() => handleSelect(b)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSelect(b); }}
            >
              <div className="belief-card__dot-wrap">
                <span className={`belief-card__dot belief-card__dot--${b.status}`} />
              </div>
              <div className="belief-card__content">
                <div className="belief-card__statement">{b.statement}</div>
                <div className="belief-card__meta">
                  <Badge color={STATUS_COLOR[b.status]}>{b.status === 'confirmed' ? 'Confirmed' : 'Hypothesis'}</Badge>
                  <span className="belief-card__meta-text">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    Since {b.createdAt}
                  </span>
                  <span className="belief-card__meta-text">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7h6M5 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    {b.sourceCount} sources
                  </span>
                  {b.inPersona && (
                    <Badge color="accent">
                      <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      In Persona
                    </Badge>
                  )}
                </div>
                {/* Evidence summary bullets */}
                {b.evidence.length > 0 && (
                  <div className="belief-card__evidence">
                    {b.evidence.slice(0, 2).map((e, i) => (
                      <div key={i} className="belief-card__evidence-item">
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1"/></svg>
                        <span>{e.snippet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="belief-card__actions-inline">
                <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); }} aria-label="Edit">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 14l3-1L13.5 4.5a1.41 1.41 0 00-2-2L3 11l-1 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Button>
                <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); }} aria-label="Delete">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </Button>
                <Button variant="icon" size="sm" onClick={(e) => { e.stopPropagation(); }} aria-label="Navigate">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ),
    };
  });

  return (
    <div className="self-page">
      <div className="self-page__header">
        <div className="self-page__header-top">
          <div>
            <div className="self-page__label">SELF MODEL</div>
            <h1 className="page-title">Self Editor</h1>
            <p className="page-subtitle">
              {confirmedCount} confirmed beliefs · {hypothesisCount} hypotheses
            </p>
          </div>
          <Button variant="primary" size="sm" className="new-belief-btn">
            + New Belief
          </Button>
        </div>
      </div>

      <div className="self-shell">
        {/* Left: belief list with tabs */}
        <div className="self-main">
          <div className="self-tabs-wrap">
            <Tabs
              items={tabItems}
              activeKey={activeTab}
              onChange={(k) => setActiveTab(k as BeliefCategory)}
              variant="pill"
              className="self-tabs"
            />
          </div>
        </div>

        {/* Right: Belief Details panel */}
        <div className="self-detail">
          {!selected ? (
            <div className="self-detail__empty">← Select a belief to inspect</div>
          ) : (
            <>
              <div className="self-detail__header-label">BELIEF DETAILS</div>

              {/* Status badge */}
              <div className="self-detail__status-row">
                <Badge color={STATUS_COLOR[selected.status]}>
                  {selected.status === 'confirmed' ? 'Confirmed' : 'Hypothesis'}
                </Badge>
              </div>

              {/* Statement */}
              <div className="self-detail__statement">
                {selected.statement}
              </div>

              {/* Evidence */}
              <div className="self-detail__section">
                <div className="self-detail__section-label">EVIDENCE</div>
                {selected.evidence.map((q, i) => (
                  <div key={i} className="self-evidence-item">
                    <span>{q.snippet}</span>
                  </div>
                ))}
                {selected.evidence.length > 0 && (
                  <button className="self-detail__view-all" onClick={() => setEvidenceOpen(true)}>
                    + View all sources
                  </button>
                )}
              </div>

              {/* Applies */}
              <div className="self-detail__section">
                <div className="self-detail__section-label">APPLIES</div>
                <div className="self-detail__applies-row">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span>Since {selected.createdAt} · ongoing</span>
                </div>
              </div>

              {/* Importance slider */}
              <div className="self-detail__section">
                <div className="self-detail__section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IMPORTANCE</span>
                  <span style={{ color: 'var(--accent-2)', fontWeight: 600 }}>{importance}%</span>
                </div>
                <div className="importance-slider-wrap">
                  <input
                    type="range"
                    className="importance-slider"
                    min={0} max={100}
                    value={importance}
                    onChange={(e) => setImportance(Number(e.target.value))}
                  />
                  <div className="importance-slider__fill" style={{ width: `${importance}%` }} />
                </div>
              </div>

              {/* Use in Persona toggle */}
              <div className="self-toggle-row">
                <span className="self-toggle-label">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Use in Persona
                </span>
                <button
                  className={`toggle-switch ${useInPersona ? 'toggle-switch--on' : ''}`}
                  onClick={() => setUseInPersona((v) => !v)}
                  role="switch"
                  aria-checked={useInPersona}
                >
                  <span className="toggle-switch__thumb" />
                </button>
              </div>

              {/* Actions */}
              <div className="self-detail__actions">
                <Button variant="primary" size="md" onClick={handleSave} loading={saving} className="confirm-belief-btn">
                  ✓ Confirm Belief
                </Button>
                <div className="self-detail__actions-row">
                  <Button variant="secondary" size="sm" onClick={() => {}}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 14l3-1L13.5 4.5a1.41 1.41 0 00-2-2L3 11l-1 3z" stroke="currentColor" strokeWidth="1.3"/></svg>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm">
                    × Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <EvidenceDrawer
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        quotes={selected?.evidence}
        why={selected ? `Evidence underpinning: "${selected.statement}"` : undefined}
      />
    </div>
  );
}
