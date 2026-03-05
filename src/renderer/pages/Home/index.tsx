// src/renderer/pages/Home/index.tsx
import React, { useEffect, useState } from 'react';
import '../pages.css';
import type { Insight, EvidenceQuote } from '../../../shared/ipc.js';
import { Card }   from '../../components/ui/Card';
import { Badge }  from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EvidenceDrawer } from '../../components/ui/EvidenceDrawer';

// ── Type meta ─────────────────────────────────────────────────────────────────
const TYPE_META: Record<string, {
  label: string;
  colorClass: string;
  icon: React.ReactNode;
}> = {
  bridge: {
    label: 'BRIDGE OF THE DAY',
    colorClass: 'insight-type-bridge',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 12c0-4 5-6.5 6-6.5S14 8 14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  pattern: {
    label: 'RECURRING PATTERN',
    colorClass: 'insight-type-pattern',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M4 8a4 4 0 014-4h0a4 4 0 010 8h0a4 4 0 01-4-4z" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M8 4v0a4 4 0 010 8" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 2"/>
      </svg>
    ),
  },
  forgotten_gem: {
    label: 'FORGOTTEN GEM',
    colorClass: 'insight-type-forgotten',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <polygon points="8,1.5 9.5,6 14,6 10.5,9 12,13.5 8,10.5 4,13.5 5.5,9 2,6 6.5,6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
  },
};

const PRIORITY_COLOR: Record<string, 'danger' | 'warning' | 'default'> = {
  high: 'danger',
  medium: 'warning',
  low: 'default',
};

// ── Week stats ────────────────────────────────────────────────────────────────
const WEEK_STATS = [
  { label: 'Atoms captured',     value: '23', change: '+3' },
  { label: 'Insights generated', value: '11', change: '+5' },
  { label: 'Patterns detected',  value: '4',  change: 'new' },
];

interface EvidenceState {
  open: boolean;
  insightId: string;
  quotes?: EvidenceQuote[];
  why?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Home() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [capture, setCapture] = useState('');
  const [evidence, setEvidence] = useState<EvidenceState>({ open: false, insightId: '' });
  const [weeklyOpen, setWeeklyOpen] = useState(false);

  useEffect(() => {
    window.neiro.insights.list().then(setInsights);
  }, []);

  const visible = insights.filter((i) => !dismissed.has(i.id));

  function handleDismiss(id: string) {
    window.neiro.feedback.submit({ eventId: id, rating: -1 });
    setDismissed((prev) => new Set([...prev, id]));
  }

  async function openEvidence(insight: Insight) {
    setEvidence({ open: true, insightId: insight.id, quotes: undefined, why: undefined });
    const quotes: EvidenceQuote[] = insight.atomIds.map((id) => ({
      atomId: id, date: '2026', source: `Memory atom – ${id}`,
      snippet: `This atom contributes to the insight: "${insight.title}"`,
    }));
    setEvidence({ open: true, insightId: insight.id, quotes, why: `These memory atoms collectively reveal: ${insight.summary}` });
  }

  // Format current date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  return (
    <>
      <div className="page-scroll-wrap">
        <header className="page-header">
          <div className="page-header__date">{dateStr}</div>
          <div className="page-header__row">
            <div>
              <h1 className="page-title">Today's Mind</h1>
              <p className="page-subtitle">
                {visible.length} insights surfaced · 1,247 atoms indexed
              </p>
            </div>
            <Button variant="ghost" size="sm" className="daily-ritual-btn">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Daily Ritual
            </Button>
          </div>
        </header>

        <div className="home-layout">
          {/* Main: insight cards — full-width stacked */}
          <div className="home-insights">
            {visible.length === 0 && (
              <p style={{ color: 'var(--faint)', fontSize: 14, padding: 'var(--space-4) 0' }}>
                No insights right now. Check back later.
              </p>
            )}
            {visible.map((insight) => {
              const meta = TYPE_META[insight.type] ?? TYPE_META.pattern;
              return (
                <Card key={insight.id} className="insight-card" interactive>
                  <Card.Inner>
                    <div className="insight-card__top">
                      <div className={`insight-card__type ${meta.colorClass}`}>
                        {meta.icon}
                        <span>{meta.label}</span>
                        <Badge color={PRIORITY_COLOR[insight.priority]} dot>{insight.priority === 'high' ? 'High' : 'Medium'}</Badge>
                      </div>
                      <span className="insight-card__date">{insight.detectedAt}</span>
                    </div>
                    <Card.Body>
                      <p className="insight-card__summary">{insight.summary}</p>
                    </Card.Body>
                    <Card.Footer>
                      <div className="insight-card__actions">
                        <Button variant="secondary" size="sm" onClick={() => openEvidence(insight)}>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                            <path d="M5 7h6M5 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          View evidence ({insight.evidenceCount})
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => window.neiro.feedback.submit({ eventId: insight.id, rating: 1 })}>
                          ✓ Accept
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDismiss(insight.id)}>
                          × Dismiss
                        </Button>
                        <Button variant="ghost" size="sm">
                          ☐ Save as rule
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card.Inner>
                </Card>
              );
            })}

            {/* Weekly Recap collapsible */}
            <div className="weekly-recap" onClick={() => setWeeklyOpen(!weeklyOpen)} role="button" tabIndex={0}>
              <div className="weekly-recap__header">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 6h12" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <span>Weekly Recap</span>
                <span className="weekly-recap__count">3 highlights</span>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={`weekly-recap__chevron ${weeklyOpen ? 'weekly-recap__chevron--open' : ''}`}
                >
                  <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {weeklyOpen && (
                <div className="weekly-recap__body">
                  <p>• Your writing quality peaks on Tuesday mornings</p>
                  <p>• 3 new connections found between old notes</p>
                  <p>• Persona accuracy improved 12% this week</p>
                </div>
              )}
            </div>
          </div>

          {/* Right rail */}
          <aside className="home-rail">
            {/* Quick Capture */}
            <div className="panel">
              <div className="panel__header">
                <span className="panel__title">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}>
                    <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Quick Capture
                </span>
              </div>
              <div className="panel__body quick-capture">
                <textarea
                  className="quick-capture__textarea"
                  placeholder="Drop a thought..."
                  value={capture}
                  onChange={(e) => setCapture(e.target.value)}
                  rows={3}
                />
                <div className="quick-capture__actions">
                  <div className="quick-capture__toggle">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <span>Analyze now</span>
                  </div>
                  <Button variant="primary" size="sm" disabled={!capture.trim()} onClick={() => setCapture('')}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M2 14l3-1L13.5 4.5a1.41 1.41 0 00-2-2L3 11l-1 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* This Week */}
            <div className="panel">
              <div className="panel__header">
                <span className="panel__title">THIS WEEK</span>
              </div>
              <div className="panel__body week-stats">
                {WEEK_STATS.map((s) => (
                  <div key={s.label} className="stat-row">
                    <span className="stat-label">{s.label}</span>
                    <div className="stat-value-group">
                      <span className="stat-value">{s.value}</span>
                      <span className="stat-change">{s.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <EvidenceDrawer
        open={evidence.open}
        onClose={() => setEvidence({ open: false, insightId: '' })}
        quotes={evidence.quotes}
        why={evidence.why}
        loading={evidence.open && !evidence.quotes}
      />
    </>
  );
}
