// Recompute each article's primary category + extra categories from Blog.csv
// with the "specific wins" priority, and patch the existing Sanity docs in place
// (no image re-upload). Run after import-articles.mjs.
//   node scripts/fix-categories.mjs "C:/Users/cheve/Downloads/Blog.csv" [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';

const envRaw = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = Object.fromEntries(
  envRaw.split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith('--')) || 'C:/Users/cheve/Downloads/Blog.csv';
const dry = args.includes('--dry');

function parseCSV(s) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < s.length; i++) { const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else { if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\r') {} else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; } else f += c; } }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const BOOL_TO_CAT = { 'Need-to-know': 'Need to know', Immigration: 'Immigration', Neighborhoods: 'Neighborhoods', 'Eat & Drinks': 'Eat & Drink', Work: 'Work', Finance: 'Finance', 'Life & Culture': 'Life & Culture', 'See & Do': 'See & Do' };
const CAT_ORDER = ['Immigration', 'Neighborhoods', 'Finance', 'Work', 'Eat & Drink', 'See & Do', 'Life & Culture', 'Need to know'];
const idFromSlug = (slug) => 'article-' + slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

const raw = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(raw); const head = rows[0];
const data = rows.slice(1).filter((r) => r.length > 1 && r[0]);
const col = (r, name) => r[head.indexOf(name)] || '';

const dist = {};
let done = 0;
for (const r of data) {
  const slug = col(r, 'Slug').trim(); if (!slug) continue;
  const cats = [...new Set(Object.keys(BOOL_TO_CAT).filter((b) => col(r, b).trim().toLowerCase() === 'true').map((b) => BOOL_TO_CAT[b]))];
  const primary = [...cats].sort((a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b))[0] || 'Need to know';
  dist[primary] = (dist[primary] || 0) + 1;
  if (dry) continue;
  const patch = client.patch(idFromSlug(slug)).set({ category: primary });
  if (cats.length > 1) patch.set({ categories: cats }); else patch.unset(['categories']);
  await patch.commit().then(() => done++).catch((e) => console.warn('  patch failed', slug, String(e.message)));
}
console.log('primary category distribution:', JSON.stringify(dist, null, 0));
console.log(dry ? '(dry run, nothing written)' : `patched ${done} documents`);
