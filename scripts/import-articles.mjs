// One-off migration: Framer "Blog.csv" export -> Sanity `article` documents.
// Converts the HTML body to Portable Text, maps the boolean category columns to
// our taxonomy, computes read time, and uploads each hero image to Sanity.
//
// Usage:  node scripts/import-articles.mjs "C:/path/Blog.csv" [--limit N] [--dry]
// Auth:   reads SANITY_API_WRITE_TOKEN + project config from .env.local
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { createClient } from '@sanity/client';

// ---------- env ----------
const envRaw = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = Object.fromEntries(
  envRaw.split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
const token = env.SANITY_API_WRITE_TOKEN;
if (!token) { console.error('Missing SANITY_API_WRITE_TOKEN in .env.local'); process.exit(1); }

const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith('--')) || 'C:/Users/cheve/Downloads/Blog.csv';
const limit = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;
const dry = args.includes('--dry');

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

// ---------- CSV ----------
function parseCSV(s) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else { if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\r') {} else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; } else f += c; }
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}

const BOOL_TO_CAT = {
  'Need-to-know': 'Need to know', Immigration: 'Immigration', Neighborhoods: 'Neighborhoods',
  'Eat & Drinks': 'Eat & Drink', Work: 'Work', Finance: 'Finance', 'Life & Culture': 'Life & Culture', 'See & Do': 'See & Do',
};
// Priority for choosing the single primary category (which chapter the article
// lands in). Specific topics win; "Need to know" is the broad catch-all and is
// used only when nothing more specific is tagged (so it maps to Housing basics).
const CAT_ORDER = ['Immigration', 'Neighborhoods', 'Finance', 'Work', 'Eat & Drink', 'See & Do', 'Life & Culture', 'Need to know'];

const rand = () => Math.random().toString(36).slice(2, 12);

// ---------- HTML -> Portable Text ----------
function inlineSpans(node, marks, markDefs) {
  const spans = [];
  node.childNodes.forEach((child) => {
    if (child.nodeType === 3) {
      const t = child.textContent;
      if (t) spans.push({ _type: 'span', _key: rand(), text: t, marks: [...marks] });
    } else if (child.nodeType === 1) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'br') spans.push({ _type: 'span', _key: rand(), text: ' ', marks: [...marks] });
      else if (tag === 'strong' || tag === 'b') spans.push(...inlineSpans(child, [...marks, 'strong'], markDefs));
      else if (tag === 'em' || tag === 'i') spans.push(...inlineSpans(child, [...marks, 'em'], markDefs));
      else if (tag === 'a') {
        const href = child.getAttribute('href') || '';
        if (href) { const key = rand(); markDefs.push({ _type: 'link', _key: key, href }); spans.push(...inlineSpans(child, [...marks, key], markDefs)); }
        else spans.push(...inlineSpans(child, marks, markDefs));
      } else if (tag === 'ul' || tag === 'ol' || tag === 'li') { /* nested lists: skip to avoid duplication */ }
      else spans.push(...inlineSpans(child, marks, markDefs));
    }
  });
  return spans;
}
function makeBlock(style, node, extra = {}) {
  const markDefs = [];
  const children = inlineSpans(node, [], markDefs).filter((s) => s.text && s.text.trim() !== '');
  // merge whitespace-only leading/trailing but keep internal
  if (children.length === 0) return null;
  return { _type: 'block', _key: rand(), style, markDefs, children, ...extra };
}
function htmlToBlocks(html) {
  const dom = new JSDOM('<body>' + (html || '') + '</body>');
  const body = dom.window.document.body;
  const blocks = [];
  Array.from(body.childNodes).forEach((node) => {
    if (node.nodeType === 3) {
      const t = node.textContent.trim();
      if (t) blocks.push({ _type: 'block', _key: rand(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: rand(), text: t, marks: [] }] });
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'h2') { const b = makeBlock('h2', node); if (b) blocks.push(b); }
    else if (['h3', 'h4', 'h5', 'h6'].includes(tag)) { const b = makeBlock('h3', node); if (b) blocks.push(b); }
    else if (tag === 'p' || tag === 'blockquote') { const b = makeBlock('normal', node); if (b) blocks.push(b); }
    else if (tag === 'ul' || tag === 'ol') {
      const listItem = tag === 'ul' ? 'bullet' : 'number';
      node.querySelectorAll(':scope > li').forEach((li) => { const b = makeBlock('normal', li, { listItem, level: 1 }); if (b) blocks.push(b); });
    } else if (tag === 'img') { /* inline body images are dropped (rare); hero image covers the visual */ }
    else { const b = makeBlock('normal', node); if (b) blocks.push(b); }
  });
  return blocks;
}
function wordCount(blocks) {
  let n = 0;
  blocks.forEach((b) => { (b.children || []).forEach((c) => { n += (c.text || '').trim().split(/\s+/).filter(Boolean).length; }); });
  return n;
}

// ---------- image upload (with tiny cache + retry) ----------
const imgCache = new Map();
async function uploadImage(url, filename) {
  if (!url) return null;
  if (imgCache.has(url)) return imgCache.get(url);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      const asset = await client.assets.upload('image', buf, { filename });
      imgCache.set(url, asset._id);
      return asset._id;
    } catch (e) { if (attempt === 1) { console.warn('  image failed:', url.slice(0, 60), String(e.message)); return null; } }
  }
  return null;
}

function idFromSlug(slug) {
  return 'article-' + slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
}

// ---------- run ----------
const raw = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(raw);
const head = rows[0];
const data = rows.slice(1).filter((r) => r.length > 1 && r[0]);
const col = (r, name) => r[head.indexOf(name)] || '';

console.log(`Importing ${Math.min(data.length, limit)} of ${data.length} articles${dry ? ' (DRY RUN)' : ''}...`);
let ok = 0, imgOk = 0;
for (let i = 0; i < data.length && i < limit; i++) {
  const r = data[i];
  const slug = col(r, 'Slug').trim();
  const title = col(r, 'Title').trim();
  if (!slug || !title) continue;

  const cats = Object.keys(BOOL_TO_CAT).filter((b) => col(r, b).trim().toLowerCase() === 'true').map((b) => BOOL_TO_CAT[b]);
  const uniqueCats = [...new Set(cats)];
  const primary = [...uniqueCats].sort((a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b))[0] || 'Need to know';

  const blocks = htmlToBlocks(col(r, 'Blog Content'));
  const readMinutes = Math.max(1, Math.round(wordCount(blocks) / 200));
  const date = col(r, 'Date').trim();

  let heroImage;
  if (!dry) {
    const assetId = await uploadImage(col(r, 'Image').trim() || col(r, 'Image URL').trim(), slug + '.jpg');
    if (assetId) { heroImage = { _type: 'image', asset: { _type: 'reference', _ref: assetId }, alt: title }; imgOk++; }
  }

  const doc = {
    _id: idFromSlug(slug),
    _type: 'article',
    title,
    slug: { _type: 'slug', current: slug },
    dek: col(r, 'Intro Description').trim(),
    category: primary,
    ...(uniqueCats.length > 1 ? { categories: uniqueCats } : {}),
    readMinutes,
    ...(heroImage ? { heroImage } : {}),
    body: blocks,
    metaTitle: col(r, 'Title Tag').trim() || undefined,
    metaDescription: col(r, 'Meta Description').trim() || undefined,
    ...(date ? { publishedAt: date } : {}),
    featured: false,
  };

  if (dry) {
    console.log(`[${i + 1}] ${slug} | ${primary} | ${blocks.length} blocks | ${readMinutes}min | cats=${uniqueCats.join('/')}`);
  } else {
    await client.createOrReplace(doc);
    ok++;
    if ((i + 1) % 10 === 0) console.log(`  ...${i + 1} done`);
  }
}
console.log(`\nDone. ${dry ? 'Parsed' : 'Imported'} ${dry ? Math.min(data.length, limit) : ok} articles, ${imgOk} images uploaded.`);
