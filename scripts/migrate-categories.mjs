// One-time migration to the chapter-level taxonomy (July 2026).
// Folds the legacy categories into the chapters they always belonged to:
//   Need to know -> Housing
//   Work         -> Finances & Work
//   Finance      -> Finances & Work
//   See & Do     -> Life & Culture
// Applies the same mapping to the "Also relevant to" array (deduped), and
// unsets the retired `featured` flag ("Start here"), which the schema
// replaced with the per-chapter `sectionHero` checkbox.
// Touches published documents and drafts alike. Idempotent.
//   node scripts/migrate-categories.mjs [--dry]
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
  apiVersion: '2024-01-01',
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
const dry = process.argv.includes('--dry');

const NEW = ['Immigration', 'Housing', 'Neighborhoods', 'Eat & Drink', 'Finances & Work', 'Life & Culture'];
const MAP = {
  'Need to know': 'Housing',
  Work: 'Finances & Work',
  Finance: 'Finances & Work',
  'See & Do': 'Life & Culture',
};
const norm = (c) => MAP[c] ?? c;

const all = await client.fetch(
  `*[_type == "article"]{_id, "slug": slug.current, category, categories, featured}`,
);

let changed = 0;
const counts = {};
for (const a of all) {
  const set = {};
  const unset = [];
  const cat = norm(a.category);
  if (!NEW.includes(cat)) {
    console.log(`SKIP ${a._id} (${a.slug}): unknown category "${a.category}"`);
    continue;
  }
  if (cat !== a.category) {
    set.category = cat;
    counts[`${a.category} -> ${cat}`] = (counts[`${a.category} -> ${cat}`] ?? 0) + 1;
  }
  if (Array.isArray(a.categories) && a.categories.length) {
    const mapped = [...new Set(a.categories.map(norm))].filter((c) => NEW.includes(c));
    if (JSON.stringify(mapped) !== JSON.stringify(a.categories)) set.categories = mapped;
  }
  if (a.featured !== undefined && a.featured !== null) unset.push('featured');
  if (!Object.keys(set).length && !unset.length) continue;
  changed++;
  console.log(`${a._id}  ${a.slug ?? '(no slug)'}  ${JSON.stringify(set)}${unset.length ? ' unset:' + unset.join(',') : ''}`);
  if (!dry) {
    let patch = client.patch(a._id);
    if (Object.keys(set).length) patch = patch.set(set);
    if (unset.length) patch = patch.unset(unset);
    await patch.commit();
  }
}

console.log(`\n${dry ? '[DRY RUN] would change' : 'changed'} ${changed} of ${all.length} docs`);
Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
