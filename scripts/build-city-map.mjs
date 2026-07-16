// Build the Amsterdam neighbourhood map from the city's open geodata.
//   node scripts/build-city-map.mjs [--refetch]
//
// Source: maps.amsterdam.nl open geodata, INDELING_WIJK (110 wijken, WGS84).
// The city publishes wijken, not the informal names people actually use, so each
// curated area below is a union of official wijk codes. Unions are computed by
// cancelling directed edges shared between neighbouring polygons, which works
// because the source is topologically clean (shared borders use identical
// coordinates). That keeps this dependency-free.
//
// Output: src/lib/cityMap.ts with static SVG paths. Nothing is fetched at
// runtime and the page makes no external requests.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'https://maps.amsterdam.nl/open_geodata/geojson_lnglat.php?KAARTLAAG=INDELING_WIJK&THEMA=gebiedsindeling';
const CACHE = path.join(process.cwd(), 'scripts', '.cache-wijk.json');
const OUT = path.join(process.cwd(), 'src', 'lib', 'cityMap.ts');

// Curated areas: the names expats use, mapped to official wijk codes.
// One consistent level, non-overlapping, so nothing nests inside anything else.
// `stadsdeel` takes every wijk in a district, used where the guide covers the
// whole district (Noord) rather than a neighbourhood inside it.
const AREAS = [
  { name: 'Centrum',        codes: ['AA', 'AD', 'AE', 'AF', 'AH', 'AJ', 'AK'] },
  { name: 'Grachtengordel', codes: ['AC', 'AG'] },
  { name: 'Jordaan',        codes: ['AB'] },
  { name: 'Westerpark',     codes: ['EA', 'EB', 'EC', 'EG', 'EH', 'EJ'] },
  { name: 'Bos en Lommer',  codes: ['ED', 'EE', 'EF'] },
  { name: 'Oud-West',       codes: ['EQ', 'ES', 'ET', 'EU', 'EV'] },
  { name: 'De Baarsjes',    codes: ['EK', 'EL', 'EM', 'EN', 'EP', 'ER'] },
  { name: 'Oud-Zuid',       codes: ['KA', 'KB', 'KC', 'KD', 'KH', 'KJ'] },
  { name: 'De Pijp',        codes: ['KE', 'KF', 'KG'] },
  { name: 'Rivierenbuurt',  codes: ['KK', 'KL', 'KM'] },
  { name: 'Zuidas',         codes: ['KN', 'KP', 'KQ', 'KR'] },
  { name: 'Noord',          stadsdeel: 'Noord' },
  { name: 'Oud-Oost',       codes: ['MB', 'MC', 'MD', 'ME'] },
  { name: 'Indische Buurt', codes: ['MA', 'MF', 'MG'] },
  { name: 'Watergraafsmeer', codes: ['MM', 'MN', 'MP', 'MQ'] },
  { name: 'IJburg',         codes: ['MH', 'MJ', 'MK', 'ML'] },
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- source ----------
async function load() {
  if (fs.existsSync(CACHE) && !process.argv.includes('--refetch')) {
    return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  }
  const res = await fetch(SRC);
  if (!res.ok) throw new Error('geodata fetch failed: HTTP ' + res.status);
  const json = await res.json();
  fs.writeFileSync(CACHE, JSON.stringify(json));
  return json;
}

// ---------- union by directed-edge cancellation ----------
const k = (p) => `${p[0]},${p[1]}`;

function unionRings(rings) {
  const edges = new Map(); // "from|to" -> [from, to]
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const a = ring[i], b = ring[i + 1];
      const ka = k(a), kb = k(b);
      if (ka === kb) continue;
      const back = `${kb}|${ka}`;
      if (edges.has(back)) edges.delete(back); // shared interior border: drop both
      else edges.set(`${ka}|${kb}`, [a, b]);
    }
  }
  // stitch surviving edges into closed rings
  const next = new Map();
  for (const [, [a, b]] of edges) {
    const ka = k(a);
    if (!next.has(ka)) next.set(ka, []);
    next.get(ka).push(b);
  }
  const out = [];
  const used = new Set();
  for (const [, [start]] of edges) {
    const ks = k(start);
    if (used.has(ks)) continue;
    const ring = [start];
    let cur = start;
    for (let guard = 0; guard < 100000; guard++) {
      const cands = next.get(k(cur));
      if (!cands || !cands.length) break;
      const nxt = cands.shift();
      ring.push(nxt);
      used.add(k(cur));
      cur = nxt;
      if (k(cur) === ks) break;
    }
    if (ring.length > 3) out.push(ring);
  }
  return out;
}

// ---------- projection ----------
function makeProjector(all, W, H, pad) {
  let minLon = 1e9, maxLon = -1e9, minLat = 1e9, maxLat = -1e9;
  all.forEach((p) => {
    if (p[0] < minLon) minLon = p[0];
    if (p[0] > maxLon) maxLon = p[0];
    if (p[1] < minLat) minLat = p[1];
    if (p[1] > maxLat) maxLat = p[1];
  });
  const lat0 = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const kx = Math.cos(lat0); // keep proportions honest at this latitude
  const w = (maxLon - minLon) * kx, h = maxLat - minLat;
  const s = Math.min((W - pad * 2) / w, (H - pad * 2) / h);
  const ox = (W - w * s) / 2, oy = (H - h * s) / 2;
  // Round to whole viewBox units. One unit is roughly 15m here and the map is
  // rendered a few hundred pixels wide, so more precision is only bytes.
  return (p) => [
    Math.round(ox + (p[0] - minLon) * kx * s),
    Math.round(oy + (maxLat - p[1]) * s), // flip: SVG y grows downward
  ];
}

// Project, then drop points the rounding made redundant. Union happens in
// lon/lat before this, so rounding cannot break edge cancellation.
function toPath(rings, proj) {
  const out = [];
  for (const ring of rings) {
    const pts = [];
    for (const p of ring) {
      const q = proj(p);
      const last = pts[pts.length - 1];
      if (!last || last[0] !== q[0] || last[1] !== q[1]) pts.push(q);
    }
    while (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
    if (pts.length < 3) continue; // collapsed to nothing at this scale
    out.push('M' + pts.map((p) => p.join(' ')).join('L') + 'Z');
  }
  return out.join('');
}

function centroid(rings, proj) {
  const big = rings.slice().sort((a, b) => b.length - a.length)[0];
  let x = 0, y = 0;
  big.forEach((p) => { const q = proj(p); x += q[0]; y += q[1]; });
  return [+(x / big.length).toFixed(1), +(y / big.length).toFixed(1)];
}

// ---------- run ----------
const geo = await load();
const feats = geo.features;
const byCode = new Map(feats.map((f) => [f.properties.Wijkcode, f]));
const ringsOf = (f) => (f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates.flat());

// resolve stadsdeel-based areas to their wijk codes
AREAS.forEach((a) => {
  if (!a.stadsdeel) return;
  a.codes = feats.filter((f) => f.properties.Stadsdeel === a.stadsdeel).map((f) => f.properties.Wijkcode);
  if (!a.codes.length) throw new Error('no wijken for stadsdeel ' + a.stadsdeel);
});

// validate the curated table against the source before building anything
const claimed = AREAS.flatMap((a) => a.codes);
const missing = claimed.filter((c) => !byCode.has(c));
const dupes = claimed.filter((c, i) => claimed.indexOf(c) !== i);
if (missing.length) throw new Error('wijk codes not in source: ' + missing.join(', '));
if (dupes.length) throw new Error('wijk codes claimed by two areas: ' + dupes.join(', '));

const W = 1000, H = 760, PAD = 14;
const allPts = feats.flatMap((f) => ringsOf(f).flat());
const proj = makeProjector(allPts, W, H, PAD);

const areas = AREAS.map((a) => {
  const rings = unionRings(a.codes.flatMap((c) => ringsOf(byCode.get(c))));
  const [cx, cy] = centroid(rings, proj);
  const km2 = a.codes.reduce((s, c) => s + byCode.get(c).properties.Oppervlakte_m2, 0) / 1e6;
  return { name: a.name, slug: slugify(a.name), d: toPath(rings, proj), cx, cy, rings: rings.length, km2: +km2.toFixed(1) };
});

// everything else keeps the city silhouette complete
const restCodes = feats.map((f) => f.properties.Wijkcode).filter((c) => !claimed.includes(c));
const restPath = toPath(unionRings(restCodes.flatMap((c) => ringsOf(byCode.get(c)))), proj);

const ts = `// GENERATED by scripts/build-city-map.mjs. Do not edit by hand.
//
// Amsterdam neighbourhood boundaries, from the city's open geodata
// (maps.amsterdam.nl, INDELING_WIJK). Each area is a union of official wijken,
// chosen so the names match how people talk about the city while the shapes stay
// accurate. Paths are pre-projected; nothing is fetched at runtime.

export interface CityArea {
  /** Display name, matches the by-area grid. */
  name: string;
  slug: string;
  /** SVG path in MAP_VIEWBOX space. */
  d: string;
  /** Label anchor. */
  cx: number;
  cy: number;
}

export const MAP_VIEWBOX = '0 0 ${W} ${H}';

/** Parts of Amsterdam outside the curated areas. Drawn so the city reads whole. */
export const CITY_REST_PATH =
  '${restPath}';

export const CITY_AREAS: CityArea[] = ${JSON.stringify(
  areas.map(({ name, slug, d, cx, cy }) => ({ name, slug, d, cx, cy })),
  null,
  2,
)};
`;

fs.writeFileSync(OUT, ts);

console.log(`areas built: ${areas.length}`);
areas.forEach((a) => console.log(`  ${a.name.padEnd(16)} ${String(a.rings).padStart(2)} ring(s)  ${String(a.km2).padStart(5)} km2  ${(a.d.length / 1024).toFixed(1)}kb`));
console.log(`\nrest-of-city: ${(restPath.length / 1024).toFixed(1)}kb from ${restCodes.length} wijken`);
console.log(`wrote ${OUT} (${(ts.length / 1024).toFixed(1)}kb)`);
