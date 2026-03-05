// scripts/build.mjs  –  production build (no Vite/webpack)
import { build } from 'esbuild';
import { mkdirSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// ── Ensure output directories ────────────────────────────────────────────────
['dist/main', 'dist/preload', 'dist/renderer'].forEach((d) =>
  mkdirSync(path.join(root, d), { recursive: true })
);

// ── Copy HTML ────────────────────────────────────────────────────────────────
copyFileSync(
  path.join(root, 'src/renderer/index.html'),
  path.join(root, 'dist/renderer/index.html')
);

console.log('[build] Starting production build…');
const t = Date.now();

// ── Build Main ───────────────────────────────────────────────────────────────
await build({
  entryPoints: [path.join(root, 'src/main/index.ts')],
  outfile: path.join(root, 'dist/main/index.js'),
  bundle: true,
  platform: 'node',
  target: 'node20',
  external: ['electron'],
  format: 'cjs',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});
console.log('[build] ✓  main');

// ── Build Preload ────────────────────────────────────────────────────────────
await build({
  entryPoints: [path.join(root, 'src/preload/index.ts')],
  outfile: path.join(root, 'dist/preload/index.js'),
  bundle: true,
  platform: 'node',
  target: 'node20',
  external: ['electron'],
  format: 'cjs',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});
console.log('[build] ✓  preload');

// ── Build Renderer ───────────────────────────────────────────────────────────
await build({
  entryPoints: [path.join(root, 'src/renderer/index.tsx')],
  outdir: path.join(root, 'dist/renderer'),
  bundle: true,
  platform: 'browser',
  target: ['chrome120'],
  format: 'esm',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  loader: { '.css': 'css', '.tsx': 'tsx', '.ts': 'ts', '.svg': 'dataurl' },
});
console.log('[build] ✓  renderer');

console.log(`[build] ✓  Done in ${Date.now() - t}ms`);
