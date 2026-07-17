// Audit every article for content that duplicates the structured SEO fields
// (summary, keyTakeaways, faqs): leftover in-body FAQ sections the earlier
// strip missed, and body headings or paragraphs that near-verbatim repeat a
// takeaway, the summary, or an FAQ answer.
//   node scripts/audit-duplication.mjs
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

const txt = (b) => (b.children || []).map((c) => c.text || '').join('').trim();
const isH = (b) => b && (b.style === 'h2' || b.style === 'h3');
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// Token-set containment: how much of the shorter text is inside the longer.
function overlap(a, b) {
  const ta = new Set(norm(a).split(' ').filter((w) => w.length > 2));
  const tb = new Set(norm(b).split(' ').filter((w) => w.length > 2));
  if (!ta.size || !tb.size) return 0;
  const [small, big] = ta.size <= tb.size ? [ta, tb] : [tb, ta];
  let hit = 0;
  for (const w of small) if (big.has(w)) hit++;
  return hit / small.size;
}

const FAQ_HEADING = /^(frequently asked questions|faqs?|common questions|faq section|veelgestelde vragen)\b|frequently asked questions/i;

const all = await client.fetch(
  `*[_type=="article" && !(_id in path("drafts.**"))]{_id,"slug":slug.current,body,summary,keyTakeaways,faqs}`,
);
const drafts = await client.fetch(`count(*[_type=="article" && _id in path("drafts.**")])`);
console.log(`articles: ${all.length} | drafts in dataset: ${drafts}\n`);

let faqLeft = 0, headDupes = 0, paraDupes = 0, qRuns = 0;
const perArticle = [];

for (const a of all) {
  const body = a.body || [];
  const added = [
    ...(a.keyTakeaways || []).map((t) => ({ kind: 'takeaway', text: t })),
    ...(a.faqs || []).flatMap((f) => [{ kind: 'faq-q', text: f.question }, { kind: 'faq-a', text: f.answer }]),
    ...(a.summary ? [{ kind: 'summary', text: a.summary }] : []),
  ];
  const findings = [];

  // 1. leftover in-body FAQ heading
  body.forEach((b, i) => {
    if (isH(b) && FAQ_HEADING.test(txt(b))) findings.push({ type: 'faq-heading', i, text: txt(b) });
  });

  // 2. runs of question-headings (>=2 consecutive h+para pairs where h ends in ?)
  for (let i = 0; i < body.length - 3; i++) {
    const qh = (b) => isH(b) && /\?\s*$/.test(txt(b));
    if (qh(body[i]) && !isH(body[i + 1]) && qh(body[i + 2]) && !isH(body[i + 3])) {
      findings.push({ type: 'question-run', i, text: txt(body[i]).slice(0, 70) });
      break; // one flag per article is enough for the report
    }
  }

  // 3. headings / standalone paragraphs near-verbatim to an added field
  body.forEach((b, i) => {
    if (b._type !== 'block' || b.listItem) return;
    const t = txt(b);
    if (t.length < 25) return;
    for (const src of added) {
      const ov = overlap(t, src.text);
      const threshold = isH(b) ? 0.85 : 0.93;
      if (ov >= threshold) {
        findings.push({ type: isH(b) ? 'heading-dupe' : 'para-dupe', i, ov: +ov.toFixed(2), of: src.kind, text: t.slice(0, 90) });
        break;
      }
    }
  });

  if (findings.length) {
    perArticle.push({ slug: a.slug, findings });
    faqLeft += findings.filter((f) => f.type === 'faq-heading').length;
    qRuns += findings.filter((f) => f.type === 'question-run').length;
    headDupes += findings.filter((f) => f.type === 'heading-dupe').length;
    paraDupes += findings.filter((f) => f.type === 'para-dupe').length;
  }
}

console.log(`articles with findings: ${perArticle.length} of ${all.length}`);
console.log(`  leftover FAQ headings: ${faqLeft}`);
console.log(`  question-run sections: ${qRuns}`);
console.log(`  heading dupes of added fields: ${headDupes}`);
console.log(`  paragraph dupes of added fields: ${paraDupes}\n`);

for (const p of perArticle.slice(0, 200)) {
  console.log(p.slug);
  p.findings.slice(0, 6).forEach((f) => console.log(`   [${f.type}${f.ov ? ' ' + f.ov + ' vs ' + f.of : ''}] @${f.i}: ${f.text}`));
}
