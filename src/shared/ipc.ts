// src/shared/ipc.ts  –  strict IPC contracts (renderer ↔ main)

// ── Domain types ─────────────────────────────────────────────────────────────

export type MemoryAtomKind = 'journal' | 'conversation' | 'note' | 'import';
export type BeliefCategory = 'value' | 'boundary' | 'pattern' | 'voice' | 'goal';
export type InsightType = 'bridge' | 'pattern' | 'forgotten_gem';
export type InsightPriority = 'high' | 'medium' | 'low';
export type BeliefStatus = 'confirmed' | 'hypothesis';
export type PersonaMode = 'now' | 'then' | 'advocate' | 'prosecutor';
export type TimeSlice = 'all' | '1y' | '6m' | '3m' | '1m';

export interface MemoryAtom {
  id: string;
  title: string;
  kind: MemoryAtomKind;
  tags: string[];
  snippet: string;
  body?: string;         // full text content
  date: string;          // ISO
  wordCount: number;
  related: string[];     // ids
  verified?: boolean;
}

export interface EvidenceQuote {
  atomId: string;
  date: string;          // ISO
  source: string;        // "Journal – 2024-11-02"
  snippet: string;
}

export interface Belief {
  id: string;
  category: BeliefCategory;
  statement: string;
  confidence: number;    // 0–1
  status: BeliefStatus;
  inPersona: boolean;
  sourceCount: number;
  evidence: EvidenceQuote[];
  createdAt: string;
  updatedAt: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  summary: string;
  atomIds: string[];
  evidenceCount: number;
  createdAt: string;
  detectedAt: string;    // human-readable like "Today, 08:42"
}

export interface PersonaResponse {
  responseId: string;
  text: string;
}

export interface EvidenceResult {
  quotes: EvidenceQuote[];
  why: string;
}

// ── IPC channel map ──────────────────────────────────────────────────────────
// Key → [RequestPayload, ResponsePayload]

export interface IpcChannels {
  'vault:search':     [{ query: string; filters?: Partial<{ kind: MemoryAtomKind; tag: string }> },  { items: MemoryAtom[] }];
  'vault:getAtom':    [string,           MemoryAtom | null];
  'persona:ask':      [{ prompt: string; mode: PersonaMode; timeSlice: TimeSlice },                  PersonaResponse];
  'persona:getEvidence': [string,        EvidenceResult];
  'self:listBeliefs': [void,             Belief[]];
  'self:updateBelief': [{ id: string; patch: Partial<Omit<Belief, 'id'>> },                         Belief];
  'feedback:submit':  [{ eventId: string; rating: 1 | -1 },                                         { ok: boolean }];
  'insights:list':    [void,             Insight[]];
}

// ── Window.neiro surface (exposed via contextBridge) ─────────────────────────

export interface NeiroAPI {
  vault: {
    search(params: IpcChannels['vault:search'][0]): Promise<IpcChannels['vault:search'][1]>;
    getAtom(id: string): Promise<IpcChannels['vault:getAtom'][1]>;
  };
  persona: {
    ask(params: IpcChannels['persona:ask'][0]): Promise<IpcChannels['persona:ask'][1]>;
    getEvidence(responseId: string): Promise<IpcChannels['persona:getEvidence'][1]>;
  };
  self: {
    listBeliefs(): Promise<IpcChannels['self:listBeliefs'][1]>;
    updateBelief(id: string, patch: Partial<Omit<Belief, 'id'>>): Promise<IpcChannels['self:updateBelief'][1]>;
  };
  feedback: {
    submit(params: IpcChannels['feedback:submit'][0]): Promise<IpcChannels['feedback:submit'][1]>;
  };
  insights: {
    list(): Promise<IpcChannels['insights:list'][1]>;
  };
}

// Augment Window
declare global {
  interface Window {
    neiro: NeiroAPI;
  }
}
