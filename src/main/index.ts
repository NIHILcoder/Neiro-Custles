// src/main/index.ts  –  Electron main process

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'path';
import { watchFile } from 'fs';
import { ATOMS, BELIEFS, INSIGHTS, PERSONA_RESPONSES, EVIDENCE_RESULTS } from '../shared/mockData.js';
import type { IpcChannels, MemoryAtom, Belief } from '../shared/ipc.js';

// ── Dev helpers ───────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';
const devPort = process.env.NEIRO_DEV_PORT ?? '3000';
const RENDERER_URL = `http://localhost:${devPort}`;
const RENDERER_FILE = join(__dirname, '../renderer/index.html');
const REBUILD_SIGNAL = join(__dirname, '../renderer/.rebuild');

// ── Window ────────────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    show: false,
    backgroundColor: '#0a0a0f',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,           // needs to be false for contextBridge with require
      webSecurity: true,
      devTools: isDev,
    },
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(isDev ? RENDERER_URL : `file://`)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow!.show();
    if (isDev) mainWindow!.webContents.openDevTools({ mode: 'detach' });
  });

  if (isDev) {
    mainWindow.loadURL(RENDERER_URL);
  } else {
    mainWindow.loadFile(RENDERER_FILE);
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── Dev: watch renderer rebuild signal ───────────────────────────────────────
function watchRendererRebuild() {
  if (!isDev) return;
  try {
    watchFile(REBUILD_SIGNAL, { interval: 300 }, () => {
      mainWindow?.webContents.reload();
      console.log('[main] renderer rebuilt → reloading window');
    });
  } catch {
    // Signal file may not exist yet; it's written by esbuild plugin on first rebuild
  }
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  watchRendererRebuild();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Helper: typed IPC handler ─────────────────────────────────────────────────
function handle<K extends keyof IpcChannels>(
  channel: K,
  fn: (payload: IpcChannels[K][0]) => IpcChannels[K][1] | Promise<IpcChannels[K][1]>
) {
  ipcMain.handle(channel, (_event, payload) => fn(payload));
}

// ── IPC Handlers (mock implementations) ──────────────────────────────────────

handle('vault:search', ({ query, filters }) => {
  const q = query.toLowerCase();
  let results = ATOMS.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.snippet.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
  if (filters?.kind) results = results.filter((a) => a.kind === filters.kind);
  if (filters?.tag)  results = results.filter((a) => a.tags.includes(filters.tag!));
  return { items: results };
});

handle('vault:getAtom', (id) => {
  return ATOMS.find((a) => a.id === id) ?? null;
});

handle('persona:ask', ({ prompt, mode }) => {
  // Deterministic mock: rotate responses
  const idx = Math.abs(prompt.length + mode.length) % PERSONA_RESPONSES.length;
  return PERSONA_RESPONSES[idx];
});

handle('persona:getEvidence', (responseId) => {
  return EVIDENCE_RESULTS[responseId] ?? { quotes: [], why: 'No evidence found for this response.' };
});

handle('self:listBeliefs', () => BELIEFS);

handle('self:updateBelief', ({ id, patch }) => {
  const belief = BELIEFS.find((b) => b.id === id);
  if (!belief) throw new Error(`Belief ${id} not found`);
  const updated: Belief = { ...belief, ...patch, id, updatedAt: new Date().toISOString().slice(0, 10) };
  BELIEFS.splice(BELIEFS.indexOf(belief), 1, updated);
  return updated;
});

handle('feedback:submit', ({ eventId, rating }) => {
  console.log(`[feedback] event=${eventId} rating=${rating}`);
  return { ok: true };
});

handle('insights:list', () => INSIGHTS);
