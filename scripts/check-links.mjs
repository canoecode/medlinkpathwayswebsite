#!/usr/bin/env node
/*
 * Link checker for the MedLink Pathways static site.
 *
 * Crawls every HTML file (plus the header and footer links in
 * /assets/js/layout.js and the targets in /_redirects) and reports any
 * internal link that points to a missing page, a missing file, or a missing
 * #anchor. External links (http, https, mailto, tel) are skipped.
 *
 * Usage:  node scripts/check-links.mjs
 * Exits with code 1 when it finds a problem.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['.git', '.claude', 'node_modules', 'scripts']);
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) found.push(...(await walk(path.join(dir, entry.name))));
    } else if (entry.name.endsWith('.html')) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

// URL path of an HTML file: /our-story/index.html -> /our-story/
function routeOf(file) {
  const rel = '/' + path.relative(ROOT, file).split(path.sep).join('/');
  return rel.replace(/index\.html$/, '');
}

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const idCache = new Map();
async function idsIn(file) {
  if (!idCache.has(file)) {
    const html = stripComments(await readFile(file, 'utf8'));
    const ids = new Set();
    for (const m of html.matchAll(/\s(?:id|name)="([^"]+)"/g)) ids.add(decode(m[1]));
    idCache.set(file, ids);
  }
  return idCache.get(file);
}

// Resolves a URL path to a file on disk, the way a static host would.
async function resolveTarget(urlPath) {
  const clean = decodeURIComponent(urlPath);
  const direct = path.join(ROOT, clean);
  if (clean.endsWith('/')) return { file: path.join(direct, 'index.html') };
  if (path.extname(clean)) return { file: direct };
  const asDir = path.join(direct, 'index.html');
  if (await exists(asDir)) return { file: asDir, note: 'missing trailing slash' };
  return { file: direct };
}

const problems = [];
let checked = 0;

async function checkLink(raw, fromRoute, fromFile, source) {
  const href = decode(raw.trim());
  if (!href || href === '#' || EXTERNAL.test(href)) return;
  checked += 1;

  const url = new URL(href, 'https://site.local' + fromRoute);
  const hash = url.hash ? decodeURIComponent(url.hash.slice(1)) : '';
  const samePage = href.startsWith('#');
  const target = samePage ? { file: fromFile } : await resolveTarget(url.pathname);

  if (!target.file || !(await exists(target.file))) {
    problems.push(`${source}: "${href}" points to a missing page or file`);
    return;
  }
  if (target.note) problems.push(`${source}: "${href}" (${target.note})`);
  if (hash && target.file.endsWith('.html') && !(await idsIn(target.file)).has(hash)) {
    problems.push(`${source}: "${href}" points to a missing anchor #${hash}`);
  }
}

const files = await walk(ROOT);

for (const file of files) {
  const route = routeOf(file);
  const html = stripComments(await readFile(file, 'utf8'));
  for (const m of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    await checkLink(m[2], route, file, route);
  }
}

// Header and footer links live in layout.js and appear on every page.
const layoutFile = path.join(ROOT, 'assets', 'js', 'layout.js');
if (await exists(layoutFile)) {
  const js = await readFile(layoutFile, 'utf8');
  const homeFile = path.join(ROOT, 'index.html');
  for (const m of js.matchAll(/href:\s*'([^']+)'/g)) await checkLink(m[1], '/', homeFile, 'layout.js');
  for (const m of js.matchAll(/(?:href|src)="([^"'+]+)"/g)) await checkLink(m[1], '/', homeFile, 'layout.js');
}

// Redirect targets must exist too.
const redirectsFile = path.join(ROOT, '_redirects');
if (await exists(redirectsFile)) {
  const lines = (await readFile(redirectsFile, 'utf8')).split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0].startsWith('/')) {
      await checkLink(parts[1], '/', path.join(ROOT, 'index.html'), '_redirects');
    }
  }
}

console.log(`Checked ${checked} internal links in ${files.length} HTML files, layout.js, and _redirects.`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log('  - ' + p);
  process.exit(1);
}
console.log('No broken internal links or anchors found.');
