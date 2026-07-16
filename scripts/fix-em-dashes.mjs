// Remove em/en dashes from article body, dek and title (client hard rule).
//   node scripts/fix-em-dashes.mjs [--dry]
// Numeric ranges become "to"; every other dash becomes a comma.
// Only span `text` is rewritten; _key, marks and markDefs are preserved.
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

const dry = process.argv.includes('--dry');
const DASH = /[—–]/;

function fix(text) {
  if (!text || !DASH.test(text)) return text;
  let s = text;
  // 1) numeric ranges: "€100 — €200" / "15 – 30"  ->  "to"
  s = s.replace(/((?:€\s*)?\d[\d.,]*)\s*[—–]\s*((?:€\s*)?\d)/g, '$1 to $2');
  // 2) any remaining dash becomes a comma
  s = s.replace(/\s*[—–]\s*/g, ', ');
  // 3) tidy artefacts
  s = s.replace(/,\s*,/g, ',').replace(/\s+,/g, ',').replace(/,\s*([.!?;:])/g, '$1').replace(/\s{2,}/g, ' ');
  return s;
}

const all = await client.fetch(`*[_type=="article"]{_id,"slug":slug.current,title,dek,body}`);
let changed = 0, spans = 0;

for (const a of all) {
  const hitTitle = DASH.test(a.title || '');
  const hitDek = DASH.test(a.dek || '');
  const hitBody = JSON.stringify(a.body || []).match(DASH);
  if (!hitTitle && !hitDek && !hitBody) continue;

  const set = {};
  if (hitTitle) set.title = fix(a.title);
  if (hitDek) set.dek = fix(a.dek);
  if (hitBody) {
    set.body = (a.body || []).map((block) => {
      if (!block.children) return block;
      return {
        ...block,
        children: block.children.map((ch) => {
          if (typeof ch.text !== 'string' || !DASH.test(ch.text)) return ch;
          spans++;
          return { ...ch, text: fix(ch.text) };
        }),
      };
    });
  }

  changed++;
  if (dry) {
    console.log(`\n${a.slug}`);
    if (hitTitle) console.log(`  title: ${a.title}\n      -> ${set.title}`);
    if (hitDek) console.log(`  dek:   ${a.dek.slice(0, 90)}\n      -> ${set.dek.slice(0, 90)}`);
    (a.body || []).forEach((b) => (b.children || []).forEach((ch) => {
      if (typeof ch.text === 'string' && DASH.test(ch.text)) {
        const before = (ch.text.match(/[^.]{0,45}[—–][^.]{0,45}/g) || [])[0];
        if (before) console.log(`  body:  ...${before.trim().replace(/\s+/g, ' ')}...\n      -> ...${fix(before).trim().replace(/\s+/g, ' ')}...`);
      }
    }));
  } else {
    await client.patch(a._id).set(set).commit();
  }
}

console.log(`\n${dry ? 'would change' : 'changed'} ${changed} articles (${spans} body spans)${dry ? ' [DRY RUN]' : ''}`);
