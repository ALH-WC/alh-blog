// Patch AI-generated SEO / answer-engine metadata into existing article docs.
//   node scripts/patch-ai-metadata.mjs <batch.json> [--dry]
// Input: JSON array of { slug, focusKeyword, keywords[], metaTitle, metaDescription,
//                        summary, keyTakeaways[], faqs[{question,answer}] }
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

const file = process.argv[2];
const dry = process.argv.includes('--dry');
if (!file) { console.error('Usage: node scripts/patch-ai-metadata.mjs <batch.json> [--dry]'); process.exit(1); }
const items = JSON.parse(fs.readFileSync(file, 'utf8'));
const rand = () => Math.random().toString(36).slice(2, 12);

// ---- validate ----
const problems = [];
const EM_DASH = /[—–]/;
for (const it of items) {
  const where = it.slug || '(missing slug)';
  if (!it.slug) problems.push('entry with no slug');
  for (const f of ['focusKeyword', 'metaTitle', 'metaDescription', 'summary']) {
    if (!it[f] || !String(it[f]).trim()) problems.push(`${where}: missing ${f}`);
  }
  if (!Array.isArray(it.keywords) || !it.keywords.length) problems.push(`${where}: no keywords`);
  if (!Array.isArray(it.keyTakeaways) || !it.keyTakeaways.length) problems.push(`${where}: no keyTakeaways`);
  if (!Array.isArray(it.faqs)) problems.push(`${where}: faqs not an array`);
  (it.faqs || []).forEach((f, i) => { if (!f.question || !f.answer) problems.push(`${where}: faq[${i}] incomplete`); });
  if (it.metaTitle && it.metaTitle.length > 70) problems.push(`${where}: metaTitle ${it.metaTitle.length} chars (>70)`);
  if (it.metaDescription && it.metaDescription.length > 180) problems.push(`${where}: metaDescription ${it.metaDescription.length} chars (>180)`);
  const blob = JSON.stringify(it);
  if (EM_DASH.test(blob)) problems.push(`${where}: contains an em/en dash`);
}

// ---- resolve slugs -> _id ----
const slugs = items.map((i) => i.slug);
const found = await client.fetch('*[_type=="article" && slug.current in $slugs]{_id,"slug":slug.current}', { slugs });
const bySlug = Object.fromEntries(found.map((d) => [d.slug, d._id]));
const missing = slugs.filter((s) => !bySlug[s]);
missing.forEach((s) => problems.push(`${s}: no matching article in Sanity`));

console.log(`entries: ${items.length} | matched in Sanity: ${found.length} | issues: ${problems.length}`);
problems.forEach((p) => console.log('  ! ' + p));
if (dry) { console.log('(dry run, nothing written)'); process.exit(0); }
if (missing.length) { console.error('Aborting: unmatched slugs. Fix them and re-run.'); process.exit(1); }

// ---- patch ----
let done = 0;
for (const it of items) {
  const set = {
    focusKeyword: it.focusKeyword,
    keywords: it.keywords,
    metaTitle: it.metaTitle,
    metaDescription: it.metaDescription,
    summary: it.summary,
    keyTakeaways: it.keyTakeaways,
    faqs: (it.faqs || []).map((f) => ({ _type: 'faq', _key: rand(), question: f.question, answer: f.answer })),
  };
  await client.patch(bySlug[it.slug]).set(set).commit()
    .then(() => done++)
    .catch((e) => console.warn('  patch failed', it.slug, String(e.message)));
}
console.log(`patched ${done}/${items.length} articles`);
