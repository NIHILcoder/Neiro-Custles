// src/shared/mockData.ts  –  seed data matching reference design

import type { MemoryAtom, Belief, Insight, EvidenceQuote, PersonaResponse, EvidenceResult } from './ipc.js';

// ── Evidence Quotes ──────────────────────────────────────────────────────────

export const QUOTES: Record<string, EvidenceQuote> = {
  q1: { atomId: 'atom1', date: 'Mar 2, 2026',  source: 'Note', snippet: 'The idea that cognition isn\'t limited to the brain — it extends into tools, environments, and other people.' },
  q2: { atomId: 'atom2', date: 'Feb 18, 2026', source: 'Note', snippet: 'I\'ve noticed I stop working on projects right at the point where they\'d be ready…' },
  q3: { atomId: 'atom3', date: 'Oct 14, 2024', source: 'Note', snippet: 'Instead of committing fully upfront, you make tiny bets that build toward a larg…' },
  q4: { atomId: 'atom4', date: 'Feb 25, 2026', source: 'Chat', snippet: 'We talked about the tension between needing freedom and needing constraints to d…' },
  q5: { atomId: 'atom5', date: 'Jan 30, 2026', source: 'Doc',  snippet: 'Applied systems thinking to personal project management. Key insight:…' },
  q6: { atomId: 'atom6', date: 'Dec 5, 2025',  source: 'Note', snippet: 'The hardest thing isn\'t having the right idea. It\'s letting go of the old one……' },
  q7: { atomId: 'atom7', date: 'Mar 3, 2026',  source: 'Journal', snippet: 'Your note on \'distributed cognition\' connects directly to the system architecture idea you explored yesterday.' },
  q8: { atomId: 'atom8', date: 'Feb 28, 2026', source: 'Journal', snippet: 'You\'ve entered the planning → polishing → pause cycle again. This is the 4th time in 6 months.' },
  q9: { atomId: 'atom3', date: 'Apr 2025',     source: 'Note', snippet: 'You wrote a note 11 months ago about \'progressive commitment as a productivity strategy\'.' },
  q10: { atomId: 'atom9', date: 'Jan 2025',    source: 'Note', snippet: '15 notes cite solo thinking as prerequisite' },
  q11: { atomId: 'atom10', date: 'Feb 2025',   source: 'Chat', snippet: 'Collaborative brainstorm notes show lower quality ideas' },
  q12: { atomId: 'atom11', date: 'Mar 2026',   source: 'Note', snippet: 'Pattern detected across 8 work contexts' },
  q13: { atomId: 'atom12', date: 'Jan 2026',   source: 'Journal', snippet: '7 notes mention going deep' },
  q14: { atomId: 'atom12', date: 'Feb 2026',   source: 'Note', snippet: 'But also 3 notes lamenting missed breadth' },
};

// ── MemoryAtoms ──────────────────────────────────────────────────────────────

export const ATOMS: MemoryAtom[] = [
  {
    id: 'atom1', title: 'Distributed cognition as architecture', kind: 'note',
    tags: ['cognition', 'architecture', 'systems'],
    snippet: 'The idea that cognition isn\'t limited to the brain — it extends into tools, envi…',
    body: 'The idea that cognition isn\'t limited to the brain — it extends into tools, environments, and other people. This is the foundation of why externalizing thought (writing, building, diagramming) is not a crutch but a fundamental upgrade to human thinking capacity.\n\nKey insight: the quality of the external structure matters enormously. A messy notebook is worse than no notebook. A well-designed system amplifies thinking; a bad one taxes it.\n\nThis connects directly to why tool design is cognitive design.',
    date: 'Mar 2, 2026', wordCount: 487, related: ['atom2', 'atom4'], verified: true,
  },
  {
    id: 'atom2', title: 'Planning → polishing → pause cycle', kind: 'note',
    tags: ['patterns', 'procrastination', 'projects'],
    snippet: 'I\'ve noticed I stop working on projects right at the point where they\'d be ready…',
    body: 'I\'ve noticed I stop working on projects right at the point where they\'d be ready…\n\nEvery time, the pattern is the same: deep planning phase, exciting polishing phase, then a sudden pause. The pause always comes with a justification — "I need more research" or "the timing isn\'t right." But the reality is something else.',
    date: 'Feb 18, 2026', wordCount: 312, related: ['atom3', 'atom6'], verified: true,
  },
  {
    id: 'atom3', title: 'Progressive commitment as strategy', kind: 'note',
    tags: ['productivity', 'commitment', 'strategy'],
    snippet: 'Instead of committing fully upfront, you make tiny bets that build toward a larg…',
    body: 'Instead of committing fully upfront, you make tiny bets that build toward a larger commitment. This reduces the psychological cost of starting and creates natural checkpoints for evaluation.',
    date: 'Oct 14, 2024', wordCount: 189, related: ['atom2'], verified: true,
  },
  {
    id: 'atom4', title: 'Autonomy vs structure conversation', kind: 'conversation',
    tags: ['autonomy', 'structure', 'work'],
    snippet: 'We talked about the tension between needing freedom and needing constraints to d…',
    body: 'We talked about the tension between needing freedom and needing constraints to do good work. The conclusion: pure freedom leads to paralysis, but structure imposed externally feels suffocating. The sweet spot is self-imposed structure with escape hatches.',
    date: 'Feb 25, 2026', wordCount: 234, related: ['atom1', 'atom5'], verified: false,
  },
  {
    id: 'atom5', title: 'System thinking for personal projects', kind: 'import',
    tags: ['systems', 'projects', 'growth'],
    snippet: 'Applied systems thinking to personal project management. Key insight:…',
    body: 'Applied systems thinking to personal project management. Key insight: most personal projects fail not from lack of motivation but from poor feedback loops. Building in weekly reviews and explicit success metrics changed everything.',
    date: 'Jan 30, 2026', wordCount: 445, related: ['atom1'],  verified: true,
  },
  {
    id: 'atom6', title: 'On changing your own mind', kind: 'note',
    tags: ['psychology', 'beliefs', 'growth'],
    snippet: 'The hardest thing isn\'t having the right idea. It\'s letting go of the old one……',
    body: 'The hardest thing isn\'t having the right idea. It\'s letting go of the old one. We hold onto outdated beliefs because they\'re woven into our identity. Changing a belief feels like losing a piece of yourself.\n\nKey question: What belief am I currently holding that I\'d update if the cost of updating were zero?',
    date: 'Dec 5, 2025', wordCount: 267, related: ['atom2', 'atom3'], verified: true,
  },
];

// ── Beliefs ──────────────────────────────────────────────────────────────────

export const BELIEFS: Belief[] = [
  {
    id: 'belief1', category: 'value',
    statement: 'I do my best thinking alone, then validate with others.',
    confidence: 0.85, status: 'confirmed', inPersona: true, sourceCount: 2,
    evidence: [QUOTES.q10, QUOTES.q11],
    createdAt: 'Jan 2025', updatedAt: 'Jan 2025',
  },
  {
    id: 'belief2', category: 'value',
    statement: 'I need structural freedom — clear outcome, flexible process.',
    confidence: 0.80, status: 'confirmed', inPersona: true, sourceCount: 2,
    evidence: [QUOTES.q12],
    createdAt: 'Mar 2025', updatedAt: 'Mar 2025',
  },
  {
    id: 'belief3', category: 'value',
    statement: 'I value depth over breadth in almost every domain.',
    confidence: 0.60, status: 'hypothesis', inPersona: false, sourceCount: 2,
    evidence: [QUOTES.q13, QUOTES.q14],
    createdAt: 'Last 6 months', updatedAt: 'Last 6 months',
  },
  {
    id: 'belief4', category: 'pattern',
    statement: 'I exit projects when the novelty fades and consistency is required.',
    confidence: 0.74, status: 'confirmed', inPersona: true, sourceCount: 3,
    evidence: [QUOTES.q2, QUOTES.q8],
    createdAt: 'Jun 2024', updatedAt: 'Nov 2024',
  },
  {
    id: 'belief5', category: 'pattern',
    statement: 'Under social pressure I compress my perspective to avoid friction.',
    confidence: 0.88, status: 'confirmed', inPersona: true, sourceCount: 2,
    evidence: [QUOTES.q4],
    createdAt: 'Jan 2025', updatedAt: 'Jan 2025',
  },
  {
    id: 'belief6', category: 'voice',
    statement: 'My clearest thinking happens in writing, not in real-time conversation.',
    confidence: 0.77, status: 'hypothesis', inPersona: false, sourceCount: 2,
    evidence: [QUOTES.q1, QUOTES.q6],
    createdAt: 'Sep 2024', updatedAt: 'Feb 2025',
  },
  {
    id: 'belief7', category: 'boundary',
    statement: 'I have the right to disengage from conversations that drain without reciprocating.',
    confidence: 0.65, status: 'confirmed', inPersona: false, sourceCount: 1,
    evidence: [QUOTES.q4],
    createdAt: 'Nov 2024', updatedAt: 'Nov 2024',
  },
];

// ── Insights ─────────────────────────────────────────────────────────────────

export const INSIGHTS: Insight[] = [
  {
    id: 'ins1', type: 'bridge', priority: 'high',
    title: 'Bridge of the Day',
    summary: 'Your note on \'distributed cognition\' (March 2025) connects directly to the system architecture idea you explored yesterday — both are about offloading mental load to external structures.',
    atomIds: ['atom1', 'atom4', 'atom5'], evidenceCount: 4,
    createdAt: '2026-03-04', detectedAt: 'Today, 08:42',
  },
  {
    id: 'ins2', type: 'pattern', priority: 'high',
    title: 'Recurring Pattern',
    summary: 'You\'ve entered the planning → polishing → pause cycle again. This is the 4th time in 6 months. You typically abandon at the polish phase.',
    atomIds: ['atom2', 'atom3'], evidenceCount: 7,
    createdAt: '2026-03-04', detectedAt: 'Detected this week',
  },
  {
    id: 'ins3', type: 'forgotten_gem', priority: 'medium',
    title: 'Forgotten Gem',
    summary: 'You wrote a note 11 months ago about \'progressive commitment as a productivity strategy\' — it directly addresses the problem you asked Persona about last week.',
    atomIds: ['atom3', 'atom6'], evidenceCount: 2,
    createdAt: '2026-03-04', detectedAt: 'Oct 14, 2024',
  },
];

// ── Persona mock responses ───────────────────────────────────────────────────

export const PERSONA_RESPONSES: PersonaResponse[] = [
  {
    responseId: 'resp1',
    text: 'Hello, Alex. I have access to 1,247 memory atoms from the last 30 days. What would you like to explore about yourself today?',
  },
  {
    responseId: 'resp2',
    text: 'This is a pattern I\'ve noticed 4 times in the last 6 months. The data suggests it\'s not fear of failure — it\'s closer to perfectionism combined with a shifted definition of \'done\'. You start polishing when the project feels real enough to be judged, and that\'s when discomfort peaks.',
  },
];

export const EVIDENCE_RESULTS: Record<string, EvidenceResult> = {
  resp1: {
    quotes: [QUOTES.q1, QUOTES.q7],
    why: 'These entries connect distributed cognition with system architecture through offloading mental load.',
  },
  resp2: {
    quotes: [QUOTES.q2, QUOTES.q8],
    why: 'These two entries separated by months show the same planning-polishing-pause cycle recurring across different project contexts.',
  },
};
