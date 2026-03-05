// scripts/dev.mjs  –  esbuild dev workflow (no Vite/webpack)
import { context } from 'esbuild';
import { spawn } from 'child_process';
import { mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createServer } from 'net';
import path from 'path';

/** Returns a free TCP port */
function getFreePort(preferred = 3000) {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.listen(preferred, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on('error', () => {
      // preferred port busy – let OS assign one
      const fallback = createServer();
      fallback.listen(0, '127.0.0.1', () => {
        const { port } = fallback.address();
        fallback.close(() => resolve(port));
      });
    });
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const _require = createRequire(import.meta.url);
const electronExe = _require('electron'); // path to electron binary

// ── Ensure output directories ────────────────────────────────────────────────
['dist/main', 'dist/preload', 'dist/renderer'].forEach((d) =>
  mkdirSync(path.join(root, d), { recursive: true })
);

// Copy HTML template to dist so esbuild serve can find it
copyFileSync(
  path.join(root, 'src/renderer/index.html'),
  path.join(root, 'dist/renderer/index.html')
);

// ── Electron process management ──────────────────────────────────────────────
let electronProcess = null;
let restartTimer = null;
let devPort = 3000;   // filled before first launch

function scheduleRestart() {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    if (electronProcess) {
      electronProcess.kill();
      electronProcess = null;
    }
    electronProcess = spawn(String(electronExe), [root], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development', NEIRO_DEV_PORT: String(devPort) },
    });
    electronProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        console.log(`[electron] exited with code ${code}`);
      }
    });
  }, 300);
}

// ── Reload signal file (renderer notifies main to reload window) ─────────────
const reloadSignal = path.join(root, 'dist/renderer/.rebuild');

// ── Plugin factories ─────────────────────────────────────────────────────────
function makeRestartPlugin(label) {
  return {
    name: 'restart-electron',
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length === 0) {
          console.log(`[${label}] rebuilt → restarting electron`);
          scheduleRestart();
        }
      });
    },
  };
}

function makeReloadPlugin() {
  return {
    name: 'signal-renderer-reload',
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length === 0) {
          writeFileSync(reloadSignal, String(Date.now()));
          console.log('[renderer] rebuilt');
        }
      });
    },
  };
}

// ── Main process context ─────────────────────────────────────────────────────
const mainCtx = await context({
  entryPoints: [path.join(root, 'src/main/index.ts')],
  outfile: path.join(root, 'dist/main/index.js'),
  bundle: true,
  platform: 'node',
  target: 'node20',
  external: ['electron'],
  format: 'cjs',
  sourcemap: true,
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [makeRestartPlugin('main')],
});

// ── Preload context ──────────────────────────────────────────────────────────
const preloadCtx = await context({
  entryPoints: [path.join(root, 'src/preload/index.ts')],
  outfile: path.join(root, 'dist/preload/index.js'),
  bundle: true,
  platform: 'node',
  target: 'node20',
  external: ['electron'],
  format: 'cjs',
  sourcemap: true,
  plugins: [makeRestartPlugin('preload')],
});

// ── Renderer context ─────────────────────────────────────────────────────────
const rendererCtx = await context({
  entryPoints: [path.join(root, 'src/renderer/index.tsx')],
  outdir: path.join(root, 'dist/renderer'),
  bundle: true,
  platform: 'browser',
  target: ['chrome120'],
  format: 'esm',
  sourcemap: true,
  define: { 'process.env.NODE_ENV': '"development"' },
  loader: { '.css': 'css', '.tsx': 'tsx', '.ts': 'ts', '.svg': 'dataurl' },
  plugins: [makeReloadPlugin()],
});

// ── Start all watchers ───────────────────────────────────────────────────────
// Build main + preload synchronously first, then enter watch mode
await mainCtx.rebuild();
await preloadCtx.rebuild();

await mainCtx.watch();
await preloadCtx.watch();

// Find free port before starting serve
devPort = await getFreePort(3000);

// Renderer: serve + watch (serve() implicitly starts the build loop)
const { port } = await rendererCtx.serve({
  servedir: path.join(root, 'dist/renderer'),
  port: devPort,
  onRequest: ({ method, path: p, status, timeInMS }) => {
    if (status >= 400) console.warn(`[renderer] ${status} ${method} ${p} (${timeInMS}ms)`);
  },
});

console.log(`\n[renderer] ✓  dev server → http://localhost:${port}`);
console.log('[main]     ✓  watching src/main');
console.log('[preload]  ✓  watching src/preload');

// Start electron after first successful build
scheduleRestart();

// Keep process alive
process.on('SIGINT', () => {
  electronProcess?.kill();
  process.exit(0);
});
