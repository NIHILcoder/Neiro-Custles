// src/renderer/pages/Vault/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import '../pages.css';
import type { MemoryAtom } from '../../../shared/ipc';
import { Input }  from '../../components/ui/Input';
import { Badge }  from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EvidenceDrawer } from '../../components/ui/EvidenceDrawer';

const KIND_COLOR: Record<string, 'default' | 'accent' | 'success' | 'warning'> = {
  journal:      'accent',
  conversation: 'success',
  note:         'default',
  import:       'warning',
};

const KIND_LABEL: Record<string, string> = {
  journal: 'Journal', conversation: 'Chat', note: 'Note', import: 'Doc',
};

const SOURCE_TYPES = [
  { key: 'all',  label: 'All',    icon: null },
  { key: 'note', label: 'Notes',  icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 5h4M6 8h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { key: 'conversation', label: 'Chats', icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 14l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { key: 'import', label: 'Docs', icon: <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 2h5l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.3"/></svg> },
];

// All topics extracted from atoms
const ALL_TOPICS = ['cognition', 'architecture', 'systems', 'patterns', 'procrastination', 'psychology', 'strategy', 'productivity', 'commitment', 'autonomy', 'structure', 'work', 'projects', 'beliefs', 'growth'];

export function Vault() {
  const [query, setQuery]             = useState('');
  const [results, setResults]         = useState<MemoryAtom[]>([]);
  const [selected, setSelected]       = useState<MemoryAtom | null>(null);
  const [loading, setLoading]         = useState(false);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await window.neiro.vault.search({ query: q });
      setResults(res.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { search(''); }, [search]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 250);
    return () => clearTimeout(t);
  }, [query, search]);

  // Apply filters
  let filtered = results;
  if (sourceFilter !== 'all') {
    filtered = filtered.filter((a) => a.kind === sourceFilter);
  }
  if (selectedTopics.size > 0) {
    filtered = filtered.filter((a) => a.tags.some(t => selectedTopics.has(t)));
  }
  if (verifiedOnly) {
    filtered = filtered.filter((a) => a.verified);
  }

  function toggleTopic(t: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  const SearchIcon = (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="vault-page">
      <div className="vault-shell">

        {/* Column 1: Filters */}
        <aside className="vault-filters">
          {/* Source Type */}
          <div className="vault-filters__section">
            <div className="vault-filters__title">SOURCE TYPE</div>
            <div className="filter-pill-group">
              {SOURCE_TYPES.filter(s => s.key !== 'all').map((s) => (
                <button
                  key={s.key}
                  className={`filter-pill ${sourceFilter === s.key ? 'filter-pill--active' : ''}`}
                  onClick={() => setSourceFilter(sourceFilter === s.key ? 'all' : s.key)}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div className="vault-filters__section">
            <div className="vault-filters__title">PERIOD</div>
            <div className="period-slider-wrap">
              <input type="range" className="period-slider" min={0} max={100} defaultValue={100} />
              <div className="period-slider__labels">
                <span>Oct 2024</span>
                <span>Mar 2026</span>
              </div>
            </div>
          </div>

          {/* Topics */}
          <div className="vault-filters__section">
            <div className="vault-filters__title">TOPICS</div>
            <div className="topic-cloud">
              {ALL_TOPICS.map((t) => (
                <button
                  key={t}
                  className={`topic-pill ${selectedTopics.has(t) ? 'topic-pill--active' : ''}`}
                  onClick={() => toggleTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Only */}
          <div className="vault-filters__section">
            <div className="verified-toggle" onClick={() => setVerifiedOnly(!verifiedOnly)} role="button" tabIndex={0}>
              <span className="verified-toggle__label">Verified only</span>
              <button
                className={`toggle-switch ${verifiedOnly ? 'toggle-switch--on' : ''}`}
                role="switch"
                aria-checked={verifiedOnly}
              >
                <span className="toggle-switch__thumb" />
              </button>
              {verifiedOnly && <Badge color="accent">{filtered.length}</Badge>}
            </div>
          </div>
        </aside>

        {/* Column 2: Results list */}
        <div className="vault-list">
          <div className="vault-list__search">
            <Input
              icon={SearchIcon}
              placeholder="Search by meaning..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="vault-list__filter-info">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{filtered.length} of {results.length} atoms</span>
          </div>

          <div className="vault-results">
            {loading && filtered.length === 0 && (
              <>
                {[1,2,3,4].map((i) => (
                  <div key={i} className="vault-atom-row">
                    <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 11, width: '40%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 11, width: '90%' }} />
                  </div>
                ))}
              </>
            )}
            {!loading && filtered.length === 0 && (
              <div className="vault-results__empty">
                No results{query ? ` for "${query}"` : ''}
              </div>
            )}
            {filtered.map((atom) => (
              <div
                key={atom.id}
                className={['vault-atom-row', selected?.id === atom.id && 'vault-atom-row--active'].filter(Boolean).join(' ')}
                onClick={() => setSelected(atom)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelected(atom); }}
              >
                <div className="vault-atom-row__header">
                  <Badge color={KIND_COLOR[atom.kind]}>{KIND_LABEL[atom.kind] || atom.kind}</Badge>
                  <span className="vault-atom-row__date">{atom.date}</span>
                </div>
                <div className="vault-atom-row__title">{atom.title}</div>
                <div className="vault-atom-row__snippet">{atom.snippet}</div>
                {atom.related.length > 0 && (
                  <div className="vault-atom-row__related">
                    {atom.related.length} related
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path d="M4 3l4 3-4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Reader */}
        <div className="vault-reader">
          {!selected ? (
            <div className="vault-reader__empty">
              <svg viewBox="0 0 24 24" fill="none" width="32" height="32" style={{ marginBottom: 'var(--space-3)', opacity: 0.3 }}>
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 8h10M7 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Select an atom to read
            </div>
          ) : (
            <>
              <div className="vault-reader__content">
                {/* Type and date badge */}
                <div className="vault-reader__meta">
                  <Badge color={KIND_COLOR[selected.kind]}>{KIND_LABEL[selected.kind] || selected.kind}</Badge>
                  <span className="vault-reader__meta-date">{selected.date}</span>
                </div>

                <h2 className="vault-reader__title">{selected.title}</h2>

                <div className="vault-reader__tags">
                  {selected.tags.map((t) => (
                    <Badge key={t} color="outline">
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1"/>
                      </svg>
                      {t}
                    </Badge>
                  ))}
                </div>

                <div className="vault-reader__body">
                  {(selected.body || selected.snippet).split('\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {/* Related Items */}
                {selected.related.length > 0 && (
                  <div className="vault-related">
                    <div className="vault-related__label">RELATED ITEMS</div>
                    <div className="vault-related__chips">
                      {selected.related.map((relId) => {
                        const rel = results.find((a) => a.id === relId);
                        return (
                          <button
                            key={relId}
                            className="vault-related-chip"
                            onClick={() => rel && setSelected(rel)}
                          >
                            <Badge color={KIND_COLOR[rel?.kind ?? 'note']} className="vault-related-chip__badge">
                              {KIND_LABEL[rel?.kind ?? 'note']}
                            </Badge>
                            <span className="vault-related-chip__title">{rel?.title ?? relId}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="vault-actions">
                <Button variant="primary" size="sm" onClick={() => {}}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M2 14l3-1L13.5 4.5a1.41 1.41 0 00-2-2L3 11l-1 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add to Self Editor
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setEvidenceOpen(true)}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M4 8h8M8 4v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Link to...
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {}}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2l1.5 3.5H14l-3 2.5L12.5 12 8 9.5 3.5 12l1.5-4-3-2.5h4.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                  Mark as important
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <EvidenceDrawer
        open={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        title={selected ? `Evidence: ${selected.title}` : 'Evidence'}
        quotes={selected?.related.map((id) => ({
          atomId: id,
          date: selected.date,
          source: `Related atom ${id}`,
          snippet: results.find((a) => a.id === id)?.snippet ?? '',
        }))}
        why={selected ? `This atom (${selected.kind}) contains ${selected.wordCount} words recorded on ${selected.date}.` : undefined}
      />
    </div>
  );
}
