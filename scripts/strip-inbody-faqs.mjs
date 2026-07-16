// Remove the FAQ section from article bodies where the article already has
// structured `faqs` (which render their own section plus FAQPage schema).
// Without this, the page shows the same questions twice.
//   node scripts/strip-inbody-faqs.mjs [--dry]
//
// Two body shapes exist in the imported content:
//   A. heading(question) + paragraph(answer) pairs
//   B. one paragraph per question with the answer concatenated onto it
// Anything after the Q/A run (several articles end with a closing paragraph)
// is preserved. Articles with no structured faqs are skipped, so they keep the
// only FAQ they have.
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
const txt = (b) => (b.children || []).map((c) => c.text || '').join('').trim();
const isH = (b) => b && (b.style === 'h2' || b.style === 'h3');
const FAQ_HEADING = /^(frequently asked questions|faqs?|common questions|faq section)\b|^frequently asked questions/i;

// Index of the first block that is NOT part of the FAQ run starting after `s`.
function faqRunEnd(body, s) {
  let i = s + 1;
  if (i >= body.length) return i;
  if (isH(body[i])) {
    // shape A: question heading followed by an answer paragraph
    while (i + 1 < body.length && isH(body[i]) && !isH(body[i + 1])) i += 2;
    if (i < body.length && isH(body[i]) && i + 1 >= body.length) i += 1; // trailing question, no answer
    return i;
  }
  // shape B: "Question?Answer" merged into one block. These are sometimes plain
  // paragraphs and sometimes bullets, so list items count here: directly under a
  // FAQ heading, a bulleted "Question?Answer" run is the FAQ, not a real list.
  const merged = (b) => !isH(b) && /\?/.test(txt(b).slice(0, 140));
  while (i < body.length && merged(body[i])) i += 1;
  return i;
}

const all = await client.fetch(`*[_type=="article"]{_id,"slug":slug.current,body,"nf":count(faqs)}`);
let changed = 0, skipped = 0, removedBlocks = 0, preserved = 0;

for (const a of all) {
  const body = a.body || [];
  const s = body.findIndex((b) => isH(b) && FAQ_HEADING.test(txt(b)));
  if (s < 0) continue;
  if (!a.nf) { skipped++; if (dry) console.log(`SKIP (no structured faqs, keeps its only FAQ): ${a.slug}`); continue; }

  const end = faqRunEnd(body, s);
  const cut = body.slice(s, end);
  const tail = body.slice(end);
  if (!cut.length) continue;

  const next = [...body.slice(0, s), ...tail];
  changed++; removedBlocks += cut.length; preserved += tail.length;

  if (dry) {
    console.log(`\n${a.slug}`);
    console.log(`  remove ${cut.length} blocks from index ${s}: "${txt(body[s])}"`);
    cut.slice(1, 3).forEach((b) => console.log(`     - [${b.style}] ${txt(b).slice(0, 60)}`));
    if (cut.length > 3) console.log(`     - ... and ${cut.length - 3} more`);
    if (tail.length) tail.forEach((b) => console.log(`  KEEP [${b.style}] ${txt(b).slice(0, 70)}`));
    console.log(`  body ${body.length} -> ${next.length} blocks`);
  } else {
    await client.patch(a._id).set({ body: next }).commit();
  }
}

console.log(`\n${dry ? 'would strip' : 'stripped'} in-body FAQ from ${changed} articles (${removedBlocks} blocks removed, ${preserved} trailing blocks preserved)`);
console.log(`skipped ${skipped} with no structured faqs${dry ? '  [DRY RUN]' : ''}`);
