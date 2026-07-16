// Export the live Sanity article set for content planning (no images).
//   node scripts/export-inventory.mjs [outDir]
// Writes two files:
//   ALH-blog-inventory.md  - compact coverage map (what a planning chat needs)
//   ALH-blog-full-text.md  - every article's full body prose
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

const outDir = process.argv[2] || '.';
const CATEGORIES = ['Immigration', 'Need to know', 'Work', 'Finance', 'Neighborhoods', 'Life & Culture', 'Eat & Drink', 'See & Do'];

const all = await client.fetch(`*[_type=="article"]|order(category asc, title asc){
  "slug":slug.current, title, dek, category, categories, readMinutes, noIndex,
  summary, keyTakeaways, faqs, focusKeyword, keywords, metaTitle, metaDescription, body
}`);

const textOf = (b) => (b.children || []).map((c) => c.text || '').join('');
const outline = (body) => (body || []).filter((b) => b.style === 'h2' || b.style === 'h3')
  .map((b) => (b.style === 'h2' ? '  - ' : '    . ') + textOf(b).trim()).filter((s) => s.trim().length > 6);
const words = (body) => (body || []).reduce((n, b) => n + textOf(b).split(/\s+/).filter(Boolean).length, 0);

// ---------- inventory ----------
const inv = [];
inv.push(`# The Amsterdam Guide: current article inventory`);
inv.push(`\n${all.length} articles, exported from the live Sanity dataset. No images.`);
inv.push(`This is the complete published set. Every article below already exists.\n`);

inv.push(`## Current taxonomy\n`);
inv.push(`Eight categories, grouped into five chapters in the site menu:\n`);
inv.push(`- **Immigration** -> chapter "Immigration"`);
inv.push(`- **Need to know** -> chapter "Housing"`);
inv.push(`- **Neighborhoods** -> chapter "Neighborhoods"`);
inv.push(`- **Finance**, **Work** -> chapter "Finances & work"`);
inv.push(`- **Life & Culture**, **Eat & Drink**, **See & Do** -> chapter "Life"\n`);

const dist = {};
all.forEach((a) => { dist[a.category] = (dist[a.category] || 0) + 1; });
inv.push(`## Current distribution\n`);
inv.push('| Category | Articles |');
inv.push('|---|---|');
CATEGORIES.forEach((c) => inv.push(`| ${c} | ${dist[c] || 0} |`));
inv.push(`| **total** | **${all.length}** |\n`);

inv.push(`## Articles\n`);
for (const c of CATEGORIES) {
  const list = all.filter((a) => a.category === c);
  inv.push(`\n---\n\n### ${c} (${list.length})\n`);
  for (const a of list) {
    inv.push(`#### ${a.title}`);
    inv.push(`- slug: \`${a.slug}\``);
    inv.push(`- primary category: ${a.category}${(a.categories || []).length ? ` | also tagged: ${a.categories.join(', ')}` : ''}`);
    inv.push(`- read time: ${a.readMinutes} min | body: ~${words(a.body)} words${a.noIndex ? ' | **noIndex (held, see refresh queue)**' : ''}`);
    if (a.focusKeyword) inv.push(`- focus keyword: ${a.focusKeyword}`);
    if (a.dek) inv.push(`- dek: ${a.dek}`);
    if (a.summary) inv.push(`- summary: ${a.summary}`);
    if ((a.keyTakeaways || []).length) {
      inv.push(`- key takeaways:`);
      a.keyTakeaways.forEach((k) => inv.push(`  - ${k}`));
    }
    if ((a.faqs || []).length) {
      inv.push(`- FAQs covered:`);
      a.faqs.forEach((f) => inv.push(`  - ${f.question}`));
    }
    const o = outline(a.body);
    if (o.length) { inv.push(`- body outline:`); o.forEach((l) => inv.push(l)); }
    inv.push('');
  }
}
const invStr = inv.join('\n');
fs.writeFileSync(path.join(outDir, 'ALH-blog-inventory.md'), invStr, 'utf8');

// ---------- full text ----------
const ft = [`# The Amsterdam Guide: full article text\n`, `${all.length} articles, full body prose. No images.\n`];
for (const a of all) {
  ft.push(`\n\n---\n`);
  ft.push(`## ${a.title}`);
  ft.push(`SLUG: ${a.slug}`);
  ft.push(`CATEGORY: ${a.category}${(a.categories || []).length ? ' | ' + a.categories.join(', ') : ''}`);
  if (a.dek) ft.push(`DEK: ${a.dek}`);
  ft.push('');
  (a.body || []).forEach((b) => {
    const t = textOf(b).trim();
    if (!t) return;
    if (b.style === 'h2') ft.push(`\n### ${t}`);
    else if (b.style === 'h3') ft.push(`\n#### ${t}`);
    else if (b.listItem) ft.push(`- ${t}`);
    else ft.push(t);
  });
}
const ftStr = ft.join('\n');
fs.writeFileSync(path.join(outDir, 'ALH-blog-full-text.md'), ftStr, 'utf8');

const kb = (s) => Math.round(s.length / 1024);
const tok = (s) => Math.round(s.length / 4 / 1000);
console.log(`ALH-blog-inventory.md  ${kb(invStr)} KB  ~${tok(invStr)}k tokens  (${all.length} articles)`);
console.log(`ALH-blog-full-text.md  ${kb(ftStr)} KB  ~${tok(ftStr)}k tokens`);
