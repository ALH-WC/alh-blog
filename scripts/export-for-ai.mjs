// Export every article (slug + title + plain-text body) into one document to
// paste into the metadata-generation chat.
//   node scripts/export-for-ai.mjs "C:/Users/cheve/Downloads/Blog.csv" "C:/Users/cheve/Downloads/Amsterdam-Guide-articles.md"
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const csvPath = process.argv[2] || 'C:/Users/cheve/Downloads/Blog.csv';
const outPath = process.argv[3] || 'C:/Users/cheve/Downloads/Amsterdam-Guide-articles.md';

function parseCSV(s) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < s.length; i++) { const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else { if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\r') {} else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; } else f += c; } }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}
function toText(html) {
  const body = new JSDOM('<body>' + (html || '') + '</body>').window.document.body;
  const out = [];
  const clean = (n) => n.textContent.replace(/\s+/g, ' ').trim();
  Array.from(body.childNodes).forEach((node) => {
    if (node.nodeType === 3) { const t = node.textContent.trim(); if (t) out.push(t); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'h2') out.push('\n## ' + clean(node));
    else if (['h3', 'h4', 'h5', 'h6'].includes(tag)) out.push('\n### ' + clean(node));
    else if (tag === 'ul') node.querySelectorAll(':scope > li').forEach((li) => out.push('- ' + clean(li)));
    else if (tag === 'ol') { let i = 1; node.querySelectorAll(':scope > li').forEach((li) => out.push((i++) + '. ' + clean(li))); }
    else if (tag !== 'img') { const t = clean(node); if (t) out.push(t); }
  });
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
const head = rows[0];
const data = rows.slice(1).filter((r) => r.length > 1 && r[0]);
const col = (r, n) => r[head.indexOf(n)] || '';

const parts = [`# The Amsterdam Guide — ${data.length} articles`,
  `Paste this after the metadata prompt. Each article is delimited by a rule. Use the exact SLUG in your JSON output.\n`];
data.forEach((r, i) => {
  parts.push('\n---\n');
  parts.push(`SLUG: ${col(r, 'Slug').trim()}`);
  parts.push(`TITLE: ${col(r, 'Title').trim()}`);
  const meta = col(r, 'Meta Description').trim();
  if (meta) parts.push(`EXISTING META DESCRIPTION: ${meta}`);
  parts.push('\nBODY:');
  parts.push(toText(col(r, 'Blog Content')));
});
const outStr = parts.join('\n');
fs.writeFileSync(outPath, outStr, 'utf8');
console.log(`Wrote ${data.length} articles to ${outPath} (${Math.round(outStr.length / 1024)} KB, ~${Math.round(outStr.length / 4 / 1000)}k tokens).`);
