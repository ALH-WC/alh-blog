// Remove the two real duplication classes the first FAQ strip missed:
//  1. trailing FAQ sections with no "Frequently Asked Questions" heading (runs
//     of question-headings at the end of the body) where structured faqs exist
//     and cover the same questions;
//  2. headings that are full declarative sentences (trailing period) whose
//     content a takeaway or the summary repeats, so the reader saw the same
//     sentence twice. Topic-label headings stay even when a takeaway covers
//     the same ground: takeaways summarize sections by design.
// Everything else that merely overlaps the structured fields is the intended
// nature of a grounded TL;DR and stays.
//   node scripts/fix-leftover-dupes.mjs [--dry]
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

const txt = (b) => (b.children || []).map((c) => c.text || '').join('').trim();
const isH = (b) => b && (b.style === 'h2' || b.style === 'h3');
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = (s) => new Set(norm(s).split(' ').filter((w) => w.length > 2));
// How much of `a` is contained in `b`.
function containment(a, b) {
  const ta = tokens(a), tb = tokens(b);
  if (!ta.size) return 0;
  let hit = 0;
  for (const w of ta) if (tb.has(w)) hit++;
  return hit / ta.size;
}

const all = await client.fetch(
  `*[_type=="article" && !(_id in path("drafts.**"))]{_id,"slug":slug.current,body,summary,keyTakeaways,faqs}`,
);

let tailsStripped = 0, headingsRemoved = 0;
for (const a of all) {
  const body = a.body || [];
  const structuredQs = (a.faqs || []).map((f) => f.question);
  if (!body.length) continue;
  let next = [...body];
  const notes = [];

  // ---- 1. trailing question-run, only when structured faqs cover it ----
  // Two shapes seen in the wild: a heading-less run of Q-heading/paragraph
  // pairs ending the body (hardware-stores), and a run under a heading the
  // first strip missed because it says "Frequently Asked Question", singular
  // (de-pijp). Pairs are strict: question-heading plus exactly one paragraph,
  // so a how-to section with bullets right above the run is never swallowed.
  if (structuredQs.length) {
    const FAQ_HEADING = /frequently asked question|^faqs?\b|^common questions\b|^faq section\b/i;
    for (const skipTrailing of [0, 1]) {
      let end = next.length - skipTrailing;
      let start = end;
      while (
        start >= 2 &&
        isH(next[start - 2]) && /\?\s*$/.test(txt(next[start - 2])) &&
        next[start - 1] && !isH(next[start - 1]) && !next[start - 1].listItem
      ) {
        start -= 2;
      }
      const pairs = (end - start) / 2;
      if (pairs < 2) continue;
      let runStart = start;
      if (runStart > 0 && isH(next[runStart - 1]) && FAQ_HEADING.test(txt(next[runStart - 1]))) runStart--;
      const runQs = [];
      for (let i = start; i < end; i += 2) runQs.push(txt(next[i]));
      const covered = runQs.filter((q) => structuredQs.some((sq) => containment(q, sq) >= 0.5 || containment(sq, q) >= 0.5)).length;
      if (covered / runQs.length >= 0.5) {
        notes.push(`tail: ${pairs} Q/A pairs removed (${covered}/${runQs.length} covered by structured faqs${runStart < start ? ', heading too' : ''})`);
        runQs.slice(0, 2).forEach((q) => notes.push(`   - ${q.slice(0, 70)}`));
        next = [...next.slice(0, runStart), ...next.slice(end)];
        tailsStripped++;
      }
      break;
    }
  }

  // ---- 2. sentence-like headings a takeaway or the summary repeats ----
  const added = [...(a.keyTakeaways || []), ...(a.summary ? [a.summary] : [])];
  if (added.length) {
    const before = next.length;
    next = next.filter((b) => {
      if (!isH(b)) return true;
      const t = txt(b);
      // Only sentence-as-heading blocks: length plus sentence-final punctuation.
      if (t.length < 40 || !/[."”]\s*$/.test(t)) return true;
      const dupe = added.some((src) => containment(t, src) >= 0.8);
      if (dupe) notes.push(`heading removed: ${t.slice(0, 80)}`);
      return !dupe;
    });
    headingsRemoved += before - next.length;
  }

  if (next.length !== body.length) {
    console.log(`${a.slug}  (${body.length} -> ${next.length} blocks)`);
    notes.forEach((n) => console.log(`   ${n}`));
    if (!dry) await client.patch(a._id).set({ body: next }).commit();
  }
}

console.log(`\n${dry ? '[DRY RUN] would strip' : 'stripped'} ${tailsStripped} trailing FAQ runs, removed ${headingsRemoved} duplicated sentence-headings`);
