// src/renderer/pages/Persona/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import '../pages.css';
import type { PersonaMode, TimeSlice } from '../../../shared/ipc.js';
import { Button } from '../../components/ui/Button';
import { Badge }  from '../../components/ui/Badge';
import { EvidenceDrawer } from '../../components/ui/EvidenceDrawer';

// ── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  responseId?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
interface ModeItem {
  key: PersonaMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MODES: ModeItem[] = [
  {
    key: 'now', label: 'Я-сейчас', description: 'Present self, current beliefs',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>,
  },
  {
    key: 'then', label: 'Я-тогда', description: 'Past patterns and decisions',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    key: 'advocate', label: 'Адвокат', description: 'Best case interpretation',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2l2.5 5H14l-3.5 3 1.5 5L8 12l-4 3 1.5-5L2 7h3.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
  },
  {
    key: 'prosecutor', label: 'Прокурор', description: 'Critical challenge',
    icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5.5 6.5L8 10l2.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="13" r="1" fill="currentColor"/></svg>,
  },
];

const TIME_SLICES: { value: TimeSlice; label: string }[] = [
  { value: 'all', label: 'All time'      },
  { value: '1y',  label: 'Last year'     },
  { value: '6m',  label: 'Last 6 months' },
  { value: '3m',  label: 'Last 3 months' },
  { value: '1m',  label: 'Last 30 days'  },
];

const SUGGESTIONS = ['Ask', 'Generate counterargument', 'Summarize in 3 steps'];

const MEMORY_SCOPES = [
  { key: 'notes', label: 'Notes',  default: true },
  { key: 'chats', label: 'Chats',  default: true },
  { key: 'docs',  label: 'Docs',   default: true },
  { key: 'code',  label: 'Code',   default: false },
];

// ── Tiny activity bars (visual decoration) ───────────────────────────────────
function ActivityChart() {
  const bars = [2,3,1,4,2,3,5,1,2,4,3,5,2,3,1,4,6,2,3,5,4,3,6,5,4,7,6,8,5,7];
  return (
    <div className="activity-chart">
      {bars.map((h, i) => (
        <div
          key={i}
          className="activity-chart__bar"
          style={{ height: `${h * 4}px`, animationDelay: `${i * 30}ms` }}
        />
      ))}
      <div className="activity-chart__labels">
        <span>Feb 2</span>
        <span>Mar 4</span>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export function Persona() {
  const [mode, setMode]           = useState<PersonaMode>('now');
  const [timeSlice, setTimeSlice] = useState<TimeSlice>('1m');
  const [scopes, setScopes]       = useState<Record<string, boolean>>({ notes: true, chats: true, docs: true, code: false });
  const [messages, setMessages]   = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: 'Hello, Alex. I have access to 1,247 memory atoms from the last 30 days. What would you like to explore about yourself today?', responseId: 'resp1' },
  ]);
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const [evidenceDrawer, setEvidenceDrawer] = useState<{
    open: boolean; responseId: string;
    quotes?: { atomId: string; date: string; source: string; snippet: string }[];
    why?: string;
  }>({ open: false, responseId: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(text?: string) {
    const prompt = (text || input).trim();
    if (!prompt || sending) return;
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    try {
      const res = await window.neiro.persona.ask({ prompt, mode, timeSlice });
      setMessages((prev) => [...prev, { id: `a${Date.now()}`, role: 'assistant', text: res.text, responseId: res.responseId }]);
    } finally {
      setSending(false);
    }
  }

  async function openEvidence(responseId: string) {
    setEvidenceDrawer({ open: true, responseId, quotes: undefined, why: undefined });
    const data = await window.neiro.persona.getEvidence(responseId);
    setEvidenceDrawer((prev) => ({ ...prev, quotes: data.quotes, why: data.why }));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function toggleScope(key: string) {
    setScopes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const activeMode = MODES.find(m => m.key === mode)!;
  const activeSlice = TIME_SLICES.find(t => t.value === timeSlice)!;

  return (
    <div className="persona-page">
      {/* Two-pane body: context sidebar + chat */}
      <div className="persona-shell">
        {/* Left: context panel */}
        <div className="persona-context">
          {/* Persona Mode — vertical list */}
          <div className="persona-context__section">
            <div className="persona-context__label">PERSONA MODE</div>
            <div className="persona-mode-list">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  className={`persona-mode-item ${mode === m.key ? 'persona-mode-item--active' : ''}`}
                  onClick={() => setMode(m.key)}
                >
                  <span className="persona-mode-item__icon">{m.icon}</span>
                  <div className="persona-mode-item__text">
                    <span className="persona-mode-item__label">{m.label}</span>
                    <span className="persona-mode-item__desc">{m.description}</span>
                  </div>
                  {mode === m.key && <span className="persona-mode-item__dot" />}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slice */}
          <div className="persona-context__section">
            <div className="persona-context__label">TIME SLICE</div>
            <select
              className="context-select"
              value={timeSlice}
              onChange={(e) => setTimeSlice(e.target.value as TimeSlice)}
            >
              {TIME_SLICES.map((ts) => (
                <option key={ts.value} value={ts.value}>{ts.label}</option>
              ))}
            </select>
          </div>

          {/* Activity mini-chart */}
          <ActivityChart />

          {/* Memory Scope */}
          <div className="persona-context__section">
            <div className="persona-context__label">MEMORY SCOPE</div>
            <div className="memory-scope-list">
              {MEMORY_SCOPES.map((s) => (
                <div key={s.key} className="memory-scope-item">
                  <span className="memory-scope-item__dot" style={{ background: scopes[s.key] ? 'var(--accent)' : 'var(--faint)' }} />
                  <span className="memory-scope-item__label">{s.label}</span>
                  <button
                    className={`toggle-switch ${scopes[s.key] ? 'toggle-switch--on' : ''}`}
                    onClick={() => toggleScope(s.key)}
                    role="switch"
                    aria-checked={scopes[s.key]}
                  >
                    <span className="toggle-switch__thumb" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Open Self Editor button at bottom */}
          <div className="persona-context__footer">
            <Button variant="secondary" size="sm" className="persona-open-self-btn">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 14l3-1L13.5 4.5a1.41 1.41 0 00-2-2L3 11l-1 3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Open Self Editor
            </Button>
          </div>
        </div>

        {/* Right: chat column */}
        <div className="persona-chat">
          {/* Chat header */}
          <div className="persona-chat__header">
            <div className="persona-chat__header-left">
              <span className="persona-chat__mode-dot" />
              <span className="persona-chat__mode-label">{activeMode.label}</span>
              <span className="persona-chat__separator">·</span>
              <span className="persona-chat__time-label">{activeSlice.label}</span>
            </div>
            <div className="persona-chat__header-right">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>Digital self mode</span>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble chat-bubble--${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-bubble__avatar">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
                <div className="chat-bubble__body">
                  <div className="chat-bubble__content">{msg.text}</div>
                  {msg.role === 'assistant' && (
                    <div className="chat-bubble__meta">
                      <span className="chat-bubble__time">
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                      {msg.responseId && (
                        <Button variant="ghost" size="xs" onClick={() => openEvidence(msg.responseId!)}>
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                            <path d="M5 7h6M5 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          Evidence
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-bubble chat-bubble--assistant">
                <div className="chat-bubble__avatar">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="chat-bubble__body">
                  <div className="chat-bubble__content" style={{ color: 'var(--faint)' }}>
                    Thinking<span className="typing-dots" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="chat-composer">
            <div className="chat-composer__input-row">
              <textarea
                className="chat-textarea"
                placeholder="Ask your digital self..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <Button variant="primary" size="md" onClick={() => handleSend()} loading={sending} disabled={!input.trim()} className="chat-send-btn">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8l12-6-4 6 4 6z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chat-suggestion" onClick={() => handleSend(s)}>
                  {s === 'Ask' && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 6.5a1.5 1.5 0 012.5 1c0 1-1.5 1-1.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="11.5" r=".5" fill="currentColor"/></svg>}
                  {s === 'Generate counterargument' && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
                  {s === 'Summarize in 3 steps' && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 4h8M4 8h6M4 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EvidenceDrawer
        open={evidenceDrawer.open}
        onClose={() => setEvidenceDrawer({ open: false, responseId: '' })}
        quotes={evidenceDrawer.quotes}
        why={evidenceDrawer.why}
        loading={evidenceDrawer.open && !evidenceDrawer.quotes}
      />
    </div>
  );
}
